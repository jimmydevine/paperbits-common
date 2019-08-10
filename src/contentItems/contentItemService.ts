import { ContentItemContract, IContentItemService } from "../contentItems";
import { IObjectStorage } from "../persistence";
import * as Constants from "../constants";
import { ILocaleService } from "../localization";

export class ContentItemService implements IContentItemService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly localeService: ILocaleService
    ) { }

    private localizedPageContractToPageContract(localeCode: string, localizedPageContract: any): any {
        const pageMetadata = localizedPageContract[Constants.localePrefix][localeCode];

        const pageContract: any = {
            key: localizedPageContract.key,
            ...pageMetadata
        };

        return pageContract;
    }

    public async getContentItemByKey(key: string): Promise<ContentItemContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        if (!key.startsWith("pages")) {
           return  await this.objectStorage.getObject<any>(key);
        }

        const locale = await this.localeService.getCurrentLocale();

        const result = await this.objectStorage.getObject<any>(key);

        if (locale) {
            return this.localizedPageContractToPageContract(locale, result);
        }
        else {
            return result;
        }
    }
}
