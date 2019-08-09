import * as Utils from "../utils";
import * as Constants from "../constants";
import { PageContract, IPageService } from ".";
import { IObjectStorage, Operator, Query } from "../persistence";
import { IBlockService } from "../blocks";
import { Contract } from "../contract";
import { ILocaleService } from "../localization";
import { LocalizedPageContract } from "./localizedPageContract";

const pagesPath = "pages";
const documentsPath = "files";
const templateBlockKey = "blocks/new-page-template";

export class LocalizedPageService implements IPageService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly blockService: IBlockService,
        private readonly localeService: ILocaleService
    ) { }

    private localizedPageContractToPageContract(localeCode: string, localizedPageContract: LocalizedPageContract): PageContract {
        const pageMetadata = localizedPageContract[Constants.localePrefix][localeCode];

        const pageContract: PageContract = {
            key: localizedPageContract.key,
            ...pageMetadata
        };

        return pageContract;
    }

    public async getPageByPermalink(permalink: string, locale: string = null): Promise<PageContract> {
        if (!permalink) {
            throw new Error(`Parameter "permalink" not specified.`);
        }

        locale = await this.localeService.getCurrentLocale();

        const permalinkProperty = locale
            ? `${Constants.localePrefix}/${locale}/permalink`
            : `permalink`;

        const query = Query
            .from<PageContract>()
            .where(permalinkProperty, Operator.equals, permalink);

        const result = await this.objectStorage.searchObjects<any>(pagesPath, query);
        const pages = Object.values(result);

        if (pages.length === 0) {
            return null;
        }

        const firstPage = pages[0];

        if (locale) {
            return this.localizedPageContractToPageContract(locale, firstPage);
        }
        else {
            return firstPage;
        }
    }

    public async getPageByKey(key: string, locale?: string): Promise<PageContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        locale = await this.localeService.getCurrentLocale();

        const result = await this.objectStorage.getObject<any>(key);

        if (locale) {
            return this.localizedPageContractToPageContract(locale, result);
        }
        else {
            return result;
        }
    }

    public async search(pattern: string, locale?: string): Promise<PageContract[]> {
        locale = await this.localeService.getCurrentLocale();

        const query = Query
            .from<PageContract>();
        // .where("title", Operator.contains, pattern)
        // .orderBy("title");
        // .select(`${Constants.localePrefix}/${locale}`);

        const result = await this.objectStorage.searchObjects<any>(pagesPath, query);
        const pages = Object.values(result);

        if (locale) {
            return pages.map(x =>
                x.locales
                    ? this.localizedPageContractToPageContract(locale, x)
                    : x);
        }

        return pages;
    }

    public async deletePage(page: PageContract | LocalizedPageContract, locale?: string): Promise<void> {
        if (!page) {
            throw new Error(`Parameter "page" not specified.`);
        }

        locale = await this.localeService.getCurrentLocale();

        if (locale) {
            /* if locale is specified, we delete only locale */
            const localizedPage = <LocalizedPageContract>page;
            const deleteContentPromise = this.objectStorage.deleteObject(localizedPage.locales[locale].contentKey);
            const deletePagePromise = this.objectStorage.deleteObject(`${page.key}/${Constants.localePrefix}/${locale}`);

            await Promise.all([deleteContentPromise, deletePagePromise]);
            return;
        }

        /* if locale is not specified, we delete entire page */
        const regularPage = <PageContract>page;
        const deleteContentPromise = this.objectStorage.deleteObject(regularPage.contentKey);
        const deletePagePromise = this.objectStorage.deleteObject(regularPage.key);

        await Promise.all([deleteContentPromise, deletePagePromise]);
    }

    public async createPage(permalink: string, title: string, description: string, keywords: string, locale?: string): Promise<PageContract> {
        locale = await this.localeService.getCurrentLocale();


        const identifier = Utils.guid();
        const pageKey = `${pagesPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const page: LocalizedPageContract = {
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

        await this.objectStorage.addObject(pageKey, page);

        const template = await this.blockService.getBlockContent(templateBlockKey);

        await this.objectStorage.addObject(contentKey, template);

        return <any>page;
    }

    public async updatePage(page: PageContract, locale?: string): Promise<void> {
        if (!page) {
            throw new Error(`Parameter "page" not specified.`);
        }

        await this.objectStorage.updateObject<PageContract>(page.key, page);
    }

    public async getPageContent(key: string, locale?: string): Promise<Contract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        // locale = await this.localeService.getCurrentLocale();

        const page: any = await this.getPageByKey(key, locale);

        // if (locale) {
        //     const localizedPage = <LocalizedPageContract>page;
        //     return await this.objectStorage.getObject(localizedPage.locales[locale].contentKey);
        //     return;
        // }

        return await this.objectStorage.getObject(page.contentKey);
    }

    public async updatePageContent(pageKey: string, content: Contract, locale?: string): Promise<void> {
        if (!pageKey) {
            throw new Error(`Parameter "pageKey" not specified.`);
        }

        if (!content) {
            throw new Error(`Parameter "content" not specified.`);
        }

        locale = await this.localeService.getCurrentLocale();

        const page = await this.getPageByKey(pageKey);
        this.objectStorage.updateObject(page.contentKey, content);
    }
}