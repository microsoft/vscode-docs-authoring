export const rowOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/row:::/g);
    },
    render(tokens, idx) {
        if (tokens[idx].info.trim().match(/row:::/g)) {
            // opening tag
            return "<div class='row'>";
        } else {
            return "";
        }
    },
};

export const rowEndOptions = {
    marker: ":",
    validate(params) {
        return params.trim().match(/row-end:::/g);
    },
    render(tokens, idx) {
        if (tokens[idx].info.trim().match(/row-end:::/g)) {
            // closing tag
            return "</div>";
        } else {
            return "";
        }
    },
};
