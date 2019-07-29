"use strict";

export const columnStructure =
    `:::column:::
    
    :::column-end:::
    `;

export function buildRow(columnNumber: number) {
    const columns = columnStructure.repeat(columnNumber);
    const rowStructure =
        `
:::row:::
    ${columns}
:::row-end:::`;
    return rowStructure;
}
