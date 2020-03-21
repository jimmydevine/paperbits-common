import * as Utils from "../utils";
import * as Constants from "../constants";
import { PageContract, IPageService } from ".";
import { IObjectStorage, Operator, Query } from "../persistence";
import { IBlockService } from "../blocks";
import { Contract } from "../contract";
import { ILocaleService } from "../localization";
import { LocalizedPageContract } from "./localizedPageContract";
import { PageMetadata } from "./pageMetadata";

const pagesPath = "pages";
const documentsPath = "files";
const templateBlockKey = "blocks/new-page-template";

export class LocalizedPageService implements IPageService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly blockService: IBlockService,
        private readonly localeService: ILocaleService
    ) {
    }

    private copyMetadata(pageMetadata: PageMetadata): PageMetadata {
        return {
            title: pageMetadata.title,
            description: pageMetadata.description,
            permalink: pageMetadata.permalink
        }
    }

    private localizedPageContractToPageContract(defaultLocale: string, currentLocale: string, requestedLocale: string, localizedPageContract: LocalizedPageContract): PageContract {
        const locales = localizedPageContract[Constants.localePrefix];

        const pageMetadata = requestedLocale
            ? locales[requestedLocale]
            : locales[currentLocale] || this.copyMetadata(locales[defaultLocale]);

        const pageContract: any = {
            key: localizedPageContract.key,
            ...pageMetadata
        };

        return pageContract;
    }

    public async getPageByPermalink(permalink: string, requestedLocale: string = null): Promise<PageContract> {
        if (!permalink) {
            throw new Error(`Parameter "permalink" not specified.`);
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();

        // const permalinkProperty = locale
        //     ? `${Constants.localePrefix}/${locale}/permalink`
        //     : `permalink`;

        const permalinkProperty = `${Constants.localePrefix}/${defaultLocale}/permalink`; // We use permalink from default locale only

        const query = Query
            .from<PageContract>()
            .where(permalinkProperty, Operator.equals, permalink);

        const result = await this.objectStorage.searchObjects<LocalizedPageContract>(pagesPath, query);

        const pages: any[] = Object.values(result);

        // if (pages.length === 0) {
        //     /* Attempting to get default locale */

        //     locale = defaultLocale;

        //     const permalinkProperty = locale
        //         ? `${Constants.localePrefix}/${defaultLocale}/permalink`
        //         : `permalink`;

        //     const query = Query
        //         .from<PageContract>()
        //         .where(permalinkProperty, Operator.equals, permalink);

        //     result = await this.objectStorage.searchObjects<any>(pagesPath, query);

        //     const pages = Object.values(result);

        //     if (pages.length === 0) {
        //         return null;
        //     }
        // }

        if (pages.length === 0) {
            return null;
        }

        const firstPage = pages[0];

        return this.localizedPageContractToPageContract(defaultLocale, currentLocale, requestedLocale, firstPage);
    }

    public async getPageByKey(key: string, requestedLocale?: string): Promise<PageContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        const pageContract = await this.objectStorage.getObject<LocalizedPageContract>(key);

        if (!pageContract) {
            return null;
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();

        return this.localizedPageContractToPageContract(defaultLocale, currentLocale, requestedLocale, pageContract);
    }

    public async search(pattern: string, requestedLocale?: string): Promise<PageContract[]> {
        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();
        const searchLocale = requestedLocale || currentLocale;

        const query = Query
            .from<PageContract>()
            .where(`locales/${searchLocale}/title`, Operator.contains, pattern)
            .orderBy(`locales/${searchLocale}/title`);

        const result = await this.objectStorage.searchObjects<any>(pagesPath, query);
        const pages = Object.values(result);

        return pages.map(x => this.localizedPageContractToPageContract(defaultLocale, searchLocale, null, x));
    }

    public async deletePage(page: PageContract): Promise<void> {
        if (!page) {
            throw new Error(`Parameter "page" not specified.`);
        }

        const localizedPageContract = await this.objectStorage.getObject<LocalizedPageContract>(page.key);

        if (localizedPageContract.locales) {
            const contentKeys = Object.values(localizedPageContract.locales).map(x => x.contentKey);

            for (const contentKey of contentKeys) {
                await this.objectStorage.deleteObject(contentKey);
            }
        }

        await this.objectStorage.deleteObject(page.key);
    }

    public async createPage(permalink: string, title: string, description: string, keywords: string): Promise<PageContract> {
        const locale = await this.localeService.getDefaultLocale();
        const identifier = Utils.guid();
        const pageKey = `${pagesPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const localizedPage: LocalizedPageContract = {
            key: pageKey,
            locales: {
                [locale]: {
                    title: title,
                    description: description,
                    keywords: keywords,
                    permalink: permalink,
                    contentKey: contentKey
                }
            }
        };

        await this.objectStorage.addObject(pageKey, localizedPage);

        const template = await this.blockService.getBlockContent(templateBlockKey);

        await this.objectStorage.addObject(contentKey, template);

        const pageContent: PageContract = {
            key: pageKey,
            title: title,
            description: description,
            keywords: keywords,
            permalink: permalink,
            contentKey: contentKey
        };

        return pageContent;
    }

    public async updatePage(page: PageContract, requestedLocale?: string): Promise<void> {
        if (!page) {
            throw new Error(`Parameter "page" not specified.`);
        }

        if (!requestedLocale) {
            requestedLocale = await this.localeService.getCurrentLocale();
        }

        const localePath = `${page.key}/${Constants.localePrefix}/${requestedLocale}`;

        await this.objectStorage.updateObject<PageContract>(localePath, page);
    }

    public async getPageContent(pageKey: string, requestedLocale?: string): Promise<Contract> {
        if (!pageKey) {
            throw new Error(`Parameter "pageKey" not specified.`);
        }

        if (!requestedLocale) {
            requestedLocale = await this.localeService.getCurrentLocale();
        }

        const defaultLocale = await this.localeService.getDefaultLocale();
        const localizedPageContract = await this.objectStorage.getObject<LocalizedPageContract>(pageKey);

        let pageMetadata = localizedPageContract.locales[requestedLocale];

        if (!pageMetadata) {
            pageMetadata = localizedPageContract.locales[defaultLocale];
        }

        let pageContent;

        if (pageMetadata.contentKey) {
            pageContent = await this.objectStorage.getObject<Contract>(pageMetadata.contentKey);
        }
        else {
            const pageDefaultLocaleMetadata = localizedPageContract.locales[defaultLocale];
            pageContent = await this.objectStorage.getObject<Contract>(pageDefaultLocaleMetadata.contentKey);
        }

        return pageContent;
    }

    public async updatePageContent(pageKey: string, content: Contract, requestedLocale?: string): Promise<void> {
        if (!pageKey) {
            throw new Error(`Parameter "pageKey" not specified.`);
        }

        if (!content) {
            throw new Error(`Parameter "content" not specified.`);
        }

        const localizedPageContract = await this.objectStorage.getObject<LocalizedPageContract>(pageKey);

        if (!localizedPageContract) {
            throw new Error(`Page with key "${pageKey}" not found.`);
        }

        if (!requestedLocale) {
            requestedLocale = await this.localeService.getCurrentLocale();
        }

        let pageMetadata = localizedPageContract.locales[requestedLocale];

        if (!pageMetadata) {
            const defaultLocale = await this.localeService.getDefaultLocale();
            const defaultPageMetadata = localizedPageContract.locales[defaultLocale];
            const identifier = Utils.guid();

            pageMetadata = this.copyMetadata(defaultPageMetadata);
            pageMetadata.contentKey = `${documentsPath}/${identifier}`;

            localizedPageContract.locales[requestedLocale] = pageMetadata;

            await this.objectStorage.updateObject(pageKey, localizedPageContract);
        }
        else if (!pageMetadata.contentKey) {
            const identifier = Utils.guid();
            pageMetadata.contentKey = `${documentsPath}/${identifier}`;
        }

        await this.objectStorage.updateObject(pageMetadata.contentKey, content);
    }
}