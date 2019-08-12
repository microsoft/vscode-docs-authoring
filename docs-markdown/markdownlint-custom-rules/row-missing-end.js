// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd004", "row-missing-end"],
    "description": `Row is missing end statement.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        var rowOpen = ":::row:::";
        var rowEnd = ":::row-end:::";
        if (params.lines.includes(rowOpen)) {
            // find the first instance of an open row and adjust line number
            let firstRow = params.lines.indexOf(rowOpen)
            let firstRowLine = firstRow + 1;
            // find the next instance of an open and the first instance of row-end
            let nextRow = params.lines.indexOf(rowOpen, firstRow + 1)
            let firstRowEnd = params.lines.indexOf(rowEnd);
            // if an open row follows another open row with no row-end between them, flag line as missing row-end
            if (nextRow < firstRowEnd && nextRow !== -1) {
                onError({
                    lineNumber: firstRowLine,
                    detail: detailStrings.rowMissingEnd,
                });
            }
        }
    }
};
