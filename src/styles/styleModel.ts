import { StyleSheet } from "./";
import { Bag } from "..";

/**
 * Style definition.
 */
export interface StyleModel {
    key: string;
    classNames: string;
    css?: string;
    styleSheet: StyleSheet;
    bindingContext?: Bag<any>;
}
