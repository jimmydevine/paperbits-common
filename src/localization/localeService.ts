import { ILocaleService } from "./ILocaleService";
import { LocaleModel } from ".";

export class LocaleService implements ILocaleService {
    private currentLocale: string;

    public async getLocales(): Promise<LocaleModel[]> {
        const locale = new LocaleModel();
        locale.code = "en-us";
        locale.displayName = "English (US)";

        return [locale];
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