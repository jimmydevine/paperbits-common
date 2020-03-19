import * as Constants from "../constants";
import { ContentItemContract, IContentItemService } from "../contentItems";
import { IObjectStorage } from "../persistence";
import { ILocaleService } from "../localization";

export class ContentItemService implements IContentItemService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly localeService: ILocaleService
    ) { }

    private localizedPageContractToPageContract(localeCode: string, defaultLocale: string, localizedPageContract: any): any {
        const pageMetadata = localizedPageContract[Constants.localePrefix][localeCode] || localizedPageContract[Constants.localePrefix][defaultLocale];

        const pageContract: any = {
            key: localizedPageContract.key,
            ...pageMetadata
        };

        return pageContract;
    }

    public async getContentItemByKey(key: string, locale?: string): Promise<ContentItemContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        const result = await this.objectStorage.getObject<any>(key);

        if (!result) {
            return null;
        }

        if (!locale) {
            locale = await this.localeService.getCurrentLocale();
        }

        const defaultLocale = await this.localeService.getDefaultLocale();

        if (locale && key.startsWith("pages/")) {
            return this.localizedPageContractToPageContract(locale, defaultLocale, result);
        }
        else {
            return result;
        }
    }

    // public async createContentItem(url: string, title: string, description: string, keywords: string): Promise<ContentItemContract> {
    //     const locale = await this.localeService.getCurrentLocale();
    //     const defaultLocale = await this.localeService.getDefaultLocale();

    //     const identifier = Utils.guid();
    //     const contentItemKey = `${contentItemsPath}/${identifier}`;
    //     const contentKey = `${documentsPath}/${identifier}`;

    //     const result = await this.objectStorage.getObject<any>(key);

    //     if (locale) {
    //         return this.localizedPageContractToPageContract(locale, defaultLocale, result);
    //     }
    //     else {
    //         return result;
    //     }
    // }
}
