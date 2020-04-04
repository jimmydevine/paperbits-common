import { NavigationItemContract } from "../navigation";

export interface INavigationService {
    /**
     * Return navigation item by key
     * @param navigationItemKey
     */
    getNavigationItemByKey(navigationItemKey: string, locale?: string): Promise<NavigationItemContract>;

    /**
     * Returns top-level navigation items.
     */
    getNavigationItems(locale?: string): Promise<NavigationItemContract[]>;

    /**
     * Updates multple navigation items.
     * @param navigationItems Array of navigation items.
     */
    updateNavigation(navigationItems: NavigationItemContract[], locale?: string): Promise<void>;
}