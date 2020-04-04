import { LayoutMetadata } from "./layoutMetadata";

export interface LayoutLocalizedContract {
    /**
     * Own key.
     */
    key: string;

    /**
     * Layout locales.
     */
    locales: {
        /**
         * e.g. "en-us".
         */
        [locale: string]: LayoutMetadata;
    };
}