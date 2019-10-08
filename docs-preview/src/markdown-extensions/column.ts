import { output } from "../extension";

export const columnOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/column(\s+span="([1-9]+)?")?:::/g) || params.trim().match(/column-end:::/g);
    },
    render(tokens, idx) {
        const RE = /column((\s+)span="([1-9]+)?")?:::/g;
        const start = RE.exec(tokens[idx].info.trim());
        if (start) {
            if (start[3]) {
                return `<div class='column span${start[3]}'>`;
            } else {
                // opening tag
                return "<div class='column'>";
            }
        } else {
            // closing tag
            return "</div>";
        }
    },
};

export function column_end(md, options) {
    const CODEBLOCK_RE = /(:::column-end:::)/g;
    const removeCodeblockSpaces = (src: string) => {
        let captureGroup;
        while ((captureGroup = CODEBLOCK_RE.exec(src))) {
            src = src.slice(0, captureGroup.index) + "\r\n:::column-end:::" + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        }
        return src;
    };

    const customCodeBlock = (state) => {
        try {
            state.src = removeCodeblockSpaces(state.src);
        } catch (error) {
            output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "custom_codeblock", customCodeBlock);
}
