import { URL } from "url";
import { DocsMicrosoftCom } from "./constants";
import { IMarkdownConfig } from "./utilities";

const docsMicrosoftCom = `https://${DocsMicrosoftCom}`;

export class RedirectUrl {
    public static parse(config: IMarkdownConfig, value: string): RedirectUrl | null {
        try {
            const input = value.startsWith("/") ? `${docsMicrosoftCom}${value}` : value;
            const url = new URL(input);
            return new RedirectUrl(config, value, url);
        } catch (error) {
            return null;
        }
    }

    get isExternalUrl(): boolean {
        return this.url.host.toLocaleLowerCase() !== DocsMicrosoftCom;
    }

    // tslint:disable-next-line: variable-name
    private _filePath: string = "";
    get filePath(): string {
        if (!!this._filePath) {
            return this._filePath;
        }

        // Put the URL into the same format as source_path, instead of
        // "/azure/cognitive-services/speech-service/overview" we'd get
        // "articles/cognitive-services/speech-service/overview.md"
        const config = this.config;
        const value = this.url.pathname;
        const replacedSegmentUrl =
            value.substring(1)
                .replace(config.docsetName, config.docsetRootFolderName);

        return this._filePath = `${replacedSegmentUrl}.md`;
    }

    private constructor(
        private readonly config: IMarkdownConfig,
        public readonly originalValue: string,
        public readonly url: URL) { }

    public toRelativeUrl(): string {
        const withoutExtension = this.filePath.replace(".md", "");
        return `/${withoutExtension.replace(this.config.docsetRootFolderName, this.config.docsetName)}`;
    }

    public adaptHashAndQueryString(redirectUrl: string): string {
        let resultingRedirectUrl = redirectUrl;
        if (this.url.search) {
            resultingRedirectUrl += this.url.search;
        }
        if (this.url.hash) {
            resultingRedirectUrl += this.url.hash;
        }
        return resultingRedirectUrl;
    }
}
