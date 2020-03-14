import { PageMetadata } from "./pageMetadata";

/**
 * Page metadata.
 */
export interface PageContract extends PageMetadata {
    /**
     * Own key.
     */
    key?: string;
}