import { readFile, writeFile } from "graceful-fs";
import { escapeRegExp, postError } from "../../helper/common";
import { showProgress } from "./utilities";
// tslint:disable-next-line: no-var-requires
const jsdiff = require("diff");

/**
 * Lower cases all metadata found in .md files
 */
export function addPeriodsToAlt(progress: any, file: string, percentComplete: number, files: string[] | null, index: number | null): Promise<any> {
    const message = "Add periods to alt text";
    if (file.endsWith(".md")) {
        return new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
                    reject();
                }
                const origin = data;
                data = parseContentAndAddPeriods(data);
                resolve({ origin, data });
            });
        }).then((result: any) => {
            const diff = jsdiff.diffChars(result.origin, result.data)
                .some((part: { added: any; removed: any; }) => {
                    return part.added || part.removed;
                });
            return new Promise((resolve, reject) => {
                if (diff) {
                    writeFile(file, result.data, (error) => {
                        if (error) {
                            postError(`Error: ${error}`);
                            reject();
                        }
                        percentComplete = showProgress(index, files, percentComplete, progress, message);
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    } else { return Promise.resolve(); }
}
function parseContentAndAddPeriods(data: string) {
    const regex = new RegExp(/\!\[(.*(?<!(\?|\!|\.)))\]\((.*)\)/g);
    const matches = data.match(regex);
    if (matches) {
        const altTextWithoutEndingPunctuationRegex = new RegExp(/\!\[(.*(?<!(\?|\!|\.)))\]\((.*)\)/);
        matches.forEach((match) => {
            const groups = altTextWithoutEndingPunctuationRegex.exec(match);
            if (groups && groups.length > 3) {
                const altTextRegex = new RegExp(escapeRegExp(`![${groups[1]}](${groups[3]})`));
                data = data.replace(altTextRegex, `![${groups[1]}.](${groups[3]})`);
            }
        });
    }
    return data;
}
