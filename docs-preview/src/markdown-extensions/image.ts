export const imageOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/image(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"\s(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?:::/g)
            || params.trim().match(/image-end:::/g);
    },
    render(tokens, idx) {
        const RE = /image(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"\s(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?(type|source|alt-text)="([a-zA-Z0-9_.\/ -]+)?"(\s)?:::/g;
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
