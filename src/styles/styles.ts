import * as Utils from "../utils";
import { StyleRule } from "./styleRule";
import { StyleMediaQuery } from "./styleMediaQuery";

export class Style {
    public readonly selector: string;
    public readonly rules: StyleRule[];
    public readonly nestedStyles: Style[];
    public readonly modifierStyles: Style[];
    public readonly pseudoStyles: Style[];
    public readonly nestedMediaQueries: StyleMediaQuery[];

    // descendant selector (space)
    // child selector (>)
    // adjacent sibling selector (+)
    // general sibling selector (~)

    constructor(selector: string) {
        this.selector = Utils.camelCaseToKebabCase(selector);
        this.rules = [];
        this.nestedStyles = [];
        this.modifierStyles = [];
        this.pseudoStyles = [];
        this.nestedMediaQueries = [];
    }

    public getRulesJssString(): string {
        const rules = this.rules.map(rule => rule.toJssString()).filter(x => !!x).join(",");
        const modifierStyles = this.modifierStyles.map(style => `"&.${style.selector}": ${style.getRulesJssString()}`).filter(x => !!x).join(",");
        const pseudoStyles = this.pseudoStyles.map(style => `"&:${style.selector}": ${style.getRulesJssString()}`).filter(x => !!x).join(",");
        const nestedStyles = this.nestedStyles.map(style => `"& .${style.selector}": ${style.getRulesJssString()}`).filter(x => !!x).join(",");
        const jssString = `{ ${[rules, modifierStyles, pseudoStyles, nestedStyles /*, nestedMediaQueries*/].filter(x => !!x).join(",")} }`;

        return jssString;
    }

    public toJssString(): string {
        const rulesJssString = this.getRulesJssString();
        const jssString = `"${this.selector}":${rulesJssString}`;

        return jssString;
    }
}

