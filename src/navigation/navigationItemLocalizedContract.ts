import { NavigationItemMetadata } from "./navigationItemMetadata";

/**
 * Data structure describing a navigation items, e.g. menus.
 */
export interface NavigationItemLocalizedContract  {
    /**
     * Own key.
     */
    key: string;

    /**
     * Key of a permalink referencing resource this navigation item is pointing to.
     */
    targetKey?: string;

    /**
     * Child navigation items.
     */
    navigationItems?: NavigationItemLocalizedContract[];

    /**
     * Navigation item locales.
     */
    locales: {
        /**
         * e.g. "en-us".
         */
        [locale: string]: NavigationItemMetadata;
    };
}