import { Style } from "./styles";

export class StyleMediaQuery {
    public minWidth: number;
    public styles: Style[];
    public globalStyles: Style[];

    constructor(minWidth: number) {
        this.minWidth = minWidth;
        this.styles = [];
        this.globalStyles = [];
    }

    public toJssString(): string {
        const stylesJss = this.styles.map(style => style.toJssString()).join();
        const globalStylesJss = this.globalStyles.map(style => style.toJssString()).join();
        const jssString = `"@media(min-width:${this.minWidth}px)":{"@global":{${[globalStylesJss, stylesJss].filter(x => !!x).join(",")}}}`;

        return jssString;
    }
}
