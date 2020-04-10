import { output } from "../extension";

const IMAGE_OPEN_RE = /image\s+(((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+))"\s*)+:::/gm;

export const imageOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(IMAGE_OPEN_RE)
            || params.trim().match(/image-end:::/g);
    },
    render(tokens, idx) {
        const start = IMAGE_OPEN_RE.exec(tokens[idx].info.trim());
        const SOURCE_RE = /source\s*=\s*"([a-zA-Z0-9_.\/ -]+)"/gi;
        const LIGHTBOX_RE = /lightbox\s*=\s*"([a-zA-Z0-9_.\/ -]+)"/gi;
        const BORDER_RE = /border\s*=\s*"([a-zA-Z0-9_.\/ -]+)"/gi;
        if (start) {
            const source = SOURCE_RE.exec(start[0])[1];
            const lightboxMatch = LIGHTBOX_RE.exec(start[0]);
            const borderMatch = BORDER_RE.exec(start[0]);

            let html = `<img src=${source}>`;
            if (!borderMatch || "true" === borderMatch[1].toLowerCase()) {
                html = `<div class="mx-imgBorder"><p>${html}</p></div>`;
            }
            if (lightboxMatch) {
                html = `<a href="${lightboxMatch[1]}#lightbox" data-linktype="relative - path">${html}</a>`;
            }

            // opening tag
            return html;
        } else {
            // closing tag
            return "";
        }
    },
};

// removes image-end and long description for rendering purposes
export function image_end(md) {
    const IMAGE_ALL_GLOBAL_RE = /(:::image\s+(((source|type|alt-text|lightbox|border|loc-scope)="((?!content|icon)[a-zA-Z0-9_.\/ -]+))"(\s*)?)+:::)([^]+?:::image-end:::)/mig;
    const IMAGE_ALL_RE = /(:::image\s+(((source|type|alt-text|lightbox|border|loc-scope)="((?!content|icon)[a-zA-Z0-9_.\/ -]+))"(\s*)?)+:::)([^]+?:::image-end:::)/mi;
    const replaceImageEnd = (src: string) => {
        const matches = src.match(IMAGE_ALL_GLOBAL_RE);
        if (matches) {
            matches.forEach((match) => {
                const found = match.match(IMAGE_ALL_RE);
                const regex = new RegExp(found[7]);
                src = src.replace(regex, "");
            });
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
