import Axios from "axios";
import * as cheerio from "cheerio";
import { XrefInfo } from "./xrefInfo";

export class XrefService {
    public static async resolveAsync(body: string): Promise<string> {
        const $ = cheerio.load(body);

        const promises = [];
        $("xref").each((_, elem) => {
            const uid = $(elem).attr("href").split("?")[0];
            const promise = XrefService.queryAsync(uid)
                .then((xrefInfo) => {
                    let source: string;
                    if (xrefInfo) {
                        source = `<a href="${xrefInfo.href}">${xrefInfo.name}</a>`;
                    } else {
                        const raw = $(elem).data("raw-source");
                        source = `<span>${this.encodeHtml(raw)}</span>`;
                    }

                    $(elem).replaceWith(source);
                });
            promises.push(promise);
        });

        await Promise.all(promises);
        return $("body").html();
    }

    private static readonly apiUrl = "https://xref.docs.microsoft.com/query?uid=";
    private static readonly cache = new Map<string, XrefInfo>();

    private static async queryAsync(uid: string): Promise<XrefInfo> {
        let result = XrefService.cache.get(uid);
        if (result !== undefined) {
        return result;
        }

        const response = await Axios.get(XrefService.apiUrl + uid);
        const etag = response.headers.etag;
        const data = response.data[0];
        result = !data ? null : new XrefInfo(data.name, data.fullName, data.href, etag);

        XrefService.cache.set(uid, result);

        return result;
    }

    private static encodeHtml(href: string): string {
        const entityPairs = [
            { character: "&", html: "&amp;" },
            { character: "<", html: "&lt;" },
            { character: ">", html: "&gt;" },
            { character: "'", html: "&apos;" },
            { character: `"`, html: "&quot;" },
        ];

        for (const pair of entityPairs) {
            href = href.replace(pair.character, pair.html);
        }

        return href;
    }
}