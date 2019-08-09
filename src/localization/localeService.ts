import { ILocaleService } from "./ILocaleService";
import { LocaleModel } from ".";

export class LocaleService implements ILocaleService {
    private currentLocale: string;
    
    constructor() {
        this.currentLocale = "en-us";
    }

    public async getLocales(): Promise<LocaleModel[]> {
        const localeEnUs = new LocaleModel();
        localeEnUs.code = "en-us";
        localeEnUs.displayName = "English (US)";

        const localeRuRu = new LocaleModel();
        localeRuRu.code = "ru-ru";
        localeRuRu.displayName = "Russian (Russia)";

        return [localeEnUs, localeRuRu];
    }

    public async createLocale(code: string, displayName: string): Promise<void> {
        // TODO
    }

    public async deleteLocale(code: string): Promise<void> {
        // TODO
    }

    public async getCurrentLocale(): Promise<string> {
        return this.currentLocale;
    }

    public async setCurrentLocale(localeCode: string): Promise<void> {
        this.currentLocale = localeCode;
    }

    public async isLocalizationEnabled(): Promise<boolean> {
        return true;
    }
}