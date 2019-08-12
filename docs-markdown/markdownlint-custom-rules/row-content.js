// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd005", "row-content"],
    "description": "Content in a row outside of a column.",
    "tags": ["validation"],
    "function": function rule(params, onError) {
        var rowOpen = ":::row:::";
        var rowEnd = ":::row-end:::";
        var columnOpen = "    :::column:::";
        var columnEnd = "    :::column-end:::";
        var columnSpan = "    :::colum span";

        if ((rowOpen)) {
            // find the first instance of an open row and adjust line number
            let firstRow = params.lines.indexOf(rowOpen)
            let lineAfterRow = firstRow + 1;
            let errorLine = lineAfterRow + 1;
            // only column is acceptable after open row
            let contentAfterRow = params.lines[lineAfterRow];
            if (contentAfterRow !== columnOpen && contentAfterRow !== columnSpan) {
                onError({
                    lineNumber: errorLine,
                    detail: detailStrings.contenOutisdeColumn,
                });
            }

            // find the first instance of an open row and adjust line number
            let firstColumnEnd = params.lines.indexOf(columnEnd)
            let lineAfterColumn = firstColumnEnd + 1;
            errorLine = lineAfterColumn + 1
            let contentAfterColumn = params.lines[lineAfterColumn];
            // :::column::: and :::row-end::: are valid after :::column-end:::
            if (contentAfterColumn !== columnOpen && contentAfterColumn !== rowEnd && contentAfterColumn !== columnSpan) {
                onError({
                    lineNumber: errorLine,
                    detail: detailStrings.contenOutisdeColumn,
                });
            }
        }
    }
};
