
import { window } from "vscode";

export const output = window.createOutputChannel("docs-preview");

export const imageOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/image(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"\s(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?:::/g)
            || params.trim().match(/image-end:::/g)
    },
    render(tokens, idx) {
        const RE = /image(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"\s(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?:::/gm;
        const start = RE.exec(tokens[idx].info.trim());
        if (start) {
            const source = start[start.indexOf("source") + 1]
            // opening tag
            return `<img src=${source}>`;
        } else {
            // closing tag
            return "";
        }
    },
};

export const IMAGE_END_RE = /.*[\s\S]:::image-end:::/gm;
export function image_end(md) {
    const replaceImageEnd = (src: string) => {
        let captureGroup;
        while ((captureGroup = IMAGE_END_RE.exec(src))) {
            src = src.slice(0, captureGroup.index) + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        }
        return src;
    };

    const importImageEnd = (state) => {
        try {
            state.src = replaceImageEnd(state.src);
        } catch (error) {
            output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "imageclose", importImageEnd);
}