import * as Constants from "../constants";
import { IObjectStorage } from "../persistence";
import { INavigationService } from "../navigation";
import { NavigationItemContract } from "./navigationItemContract";
import { NavigationItemLocalizedContract } from "./navigationItemLocalizedContract";
import { ILocaleService } from "../localization";
import { NavigationItemMetadata } from "./navigationItemMetadata";

const navigationItemsPath = "navigationItems";

export class NavigationService implements INavigationService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly localeService: ILocaleService
    ) { }


    private localizedContractToContract(defaultLocale: string, currentLocale: string, requestedLocale: string, localizedPageContract: NavigationItemLocalizedContract): NavigationItemContract {
        const locales = localizedPageContract[Constants.localePrefix];

        const navitemContract: NavigationItemContract = {
            key: localizedPageContract.key,
            label: requestedLocale
                ? locales[requestedLocale]?.label
                : locales[currentLocale]?.label || locales[defaultLocale]?.label,
            targetKey: localizedPageContract.targetKey,
            navigationItems: localizedPageContract.navigationItems?.map(navItem => this.localizedContractToContract(defaultLocale, currentLocale, requestedLocale, navItem))
        };

        return navitemContract;
    }

    private contractTolocalizedContract(navigationItemContract: NavigationItemContract, locale: string): NavigationItemLocalizedContract {
        const navitemLocalizedContract: NavigationItemLocalizedContract = {
            key: navigationItemContract.key,
            locales: {
                [locale]: {
                    label: navigationItemContract.label,
                }
            },
            targetKey: navigationItemContract.targetKey,
            navigationItems: navigationItemContract.navigationItems?.map(navItem => this.contractTolocalizedContract(navItem, locale))
        };

        return navitemLocalizedContract;
    }

    private find(items: NavigationItemContract[], key: string): NavigationItemContract {
        for (const item of items) {
            if (item.key === key) {
                return item;
            }
            else if (item.navigationItems) {
                const child = this.find(item.navigationItems, key);

                if (child) {
                    return child;
                }
            }
        }
    }

    public async getNavigationItemByKey(navigationItemKey: string, requestedLocale: string = null): Promise<NavigationItemContract> {
        const items = await this.getNavigationItems(requestedLocale);
        return this.find(items, navigationItemKey);
    }

    public async getNavigationItems(requestedLocale: string = null): Promise<NavigationItemContract[]> {
        const result = await this.objectStorage.getObject<NavigationItemLocalizedContract>(navigationItemsPath);
        const items: NavigationItemLocalizedContract[] = result ? Object.values(result) : [];

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();

        const navItems = items.map(x => this.localizedContractToContract(defaultLocale, currentLocale, requestedLocale, x));

        return navItems;
    }

    private applyOnTop(primary: NavigationItemLocalizedContract, secondary: NavigationItemLocalizedContract): void {
        const secondaryLocales = Object.keys(secondary.locales);

        secondaryLocales.forEach(locale => {
            primary.locales[locale] = secondary.locales[locale];
        });
    }

    public async updateNavigation(navigationItems: NavigationItemContract[], requestedLocale: string = null): Promise<void> {
        // await this.objectStorage.updateObject(`${navigationItemsPath}`, navigationItems);

        const result = await this.objectStorage.getObject<NavigationItemLocalizedContract>(navigationItemsPath);
        const existingItems: NavigationItemLocalizedContract[] = result ? Object.values(result) : [];

        const defaultLocale = await this.localeService.getDefaultLocale();
        const currentLocale = await this.localeService.getCurrentLocale();

        if (currentLocale === defaultLocale) {
            const localizedNavItems = navigationItems.map(navItem => this.contractTolocalizedContract(navItem, defaultLocale));
            localizedNavItems.map(navItem => this.applyOnTop())
        }
        else {

        }



        // if (!navigationItems) {
        //     throw new Error(`Parameter "navigationItems" not specified.`);
        // }

        // if (!requestedLocale) {
        //     requestedLocale = await this.localeService.getCurrentLocale();
        // }

        // const pageContract = await this.objectStorage.getObject<NavigationItemLocalizedContract>(page.key);

        // if (!pageContract) {
        //     throw new Error(`Could not update page. Page with key "${page.key}" doesn't exist.`);
        // }

        // const existingLocaleMetadata = pageContract.locales[requestedLocale] || <PageMetadata>{};

        // pageContract.locales[requestedLocale] = this.copyMetadata(page, existingLocaleMetadata);

        // await this.objectStorage.updateObject<PageLocalizedContract>(page.key, pageContract);
    }
}