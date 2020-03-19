import { IPermalinkResolver } from "./";
import { HyperlinkContract } from "../editing";
import { HyperlinkModel } from "./hyperlinkModel";

export class PermalinkResolver implements IPermalinkResolver {
    constructor(private readonly permalinkResolvers: IPermalinkResolver[]) { }

    public canHandleTarget(targetKey: string): boolean {
        return this.permalinkResolvers.some(x => x.canHandleTarget(targetKey));
    }

    public async getUrlByTargetKey(targetKey: string, locale?: string): Promise<string> {
        if (!targetKey) {
            throw new Error(`Parameter "targetKey" not specified.`);
        }

        const permalinkResolver = this.permalinkResolvers.find(x => x.canHandleTarget(targetKey));
        const targetUrl = await permalinkResolver.getUrlByTargetKey(targetKey, locale);

        return targetUrl;
    }

    public async getHyperlinkFromContract(hyperlinkContract: HyperlinkContract, locale?: string): Promise<HyperlinkModel> {
        let hyperlinkModel: HyperlinkModel;

        const permalinkResolver = this.permalinkResolvers.find(x => x.canHandleTarget(hyperlinkContract.targetKey));

        if (permalinkResolver) {
            hyperlinkModel = await permalinkResolver.getHyperlinkFromContract(hyperlinkContract, locale);

            if (hyperlinkModel) {
                return hyperlinkModel;
            }
        }
        else {
            console.warn(`Could not find permalink resolver for target key "${hyperlinkContract.targetKey}"`);
        }

        hyperlinkModel = new HyperlinkModel();
        hyperlinkModel.title = "Unset link";
        hyperlinkModel.target = hyperlinkContract.target;
        hyperlinkModel.targetKey = null;
        hyperlinkModel.href = "#";
        hyperlinkModel.anchor = hyperlinkContract.anchor;

        return hyperlinkModel;
    }

    public async getHyperlinkByTargetKey(targetKey: string, locale?: string): Promise<HyperlinkModel> {
        const permalinkResolver = this.permalinkResolvers.find(x => x.canHandleTarget(targetKey));
        const hyperlink = await permalinkResolver.getHyperlinkByTargetKey(targetKey, locale);

        return hyperlink;
    }
}