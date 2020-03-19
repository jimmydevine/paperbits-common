import { Contract } from "../";
import { ContentItemContract } from "../contentItems/contentItemContract";

/**
 * Service for managing contentItems.
 */
export interface IContentItemService {
    /**
     * Returns contentItem by specified key.
     */
    getContentItemByKey(key: string, locale?: string): Promise<ContentItemContract>;
}
