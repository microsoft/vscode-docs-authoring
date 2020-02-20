import { Selection, TextDocument, TextEditor } from "vscode";

interface IndexLinePair {
    index: number;
    line: string;
}

enum ColumnAlignment {
    None,
    Left,
    Center,
    Right,
}

export class MarkdownTable {
    public static parse(selection: Selection, document: TextDocument): MarkdownTable | null {
        if (!selection || selection.isSingleLine || !document) {
            return null;
        }

        const parseLine = (selection: Selection) => {
            const startLine = selection.start.line;
            // git const 
            const textLine = document.lineAt(selection.start.line);
            return textLine.text;
        };

        const map = new Map<IndexLinePair, Selection>();
        selections.forEach((selection, index) => map.set({ index, line: parseLine(selection) }, selection));

        return new MarkdownTable(map);
    }

    private constructor(private lines: ReadonlyMap<IndexLinePair, Selection>) { }

    public async reformat(editor: TextEditor) {
        const measureColumnSpan = (column: string) => {
            const trimmed = column.trim();
            return trimmed.length;
        };

        const parseColumnAlignment = (column: string) => {
            const trimmed = column.trim();
            if (trimmed.length > 0) {
                const left = trimmed.startsWith(":");
                const right = trimmed.endsWith(":");
                if (left && right) {
                    return ColumnAlignment.Center;
                }
                if (left) {
                    return ColumnAlignment.Left;
                }
                if (right) {
                    return ColumnAlignment.Right;
                }
            }

            return ColumnAlignment.None;
        };

        let isFirstColumnSpace: boolean = false;
        const columnSpanLengths = new Map<number, number>();
        const columnAlignments = new Map<number, ColumnAlignment>();
        this.lines.forEach((_, pair, map) => {
            const { index, line } = pair;
            const columns = line.split("|");
            switch (index) {
                case 0: // Table headings
                    isFirstColumnSpace = measureColumnSpan(columns[0]) === 0;
                    columns.forEach((col, i) => columnSpanLengths.set(i, measureColumnSpan(col)));
                    break;
                case 1: // Column formatting
                    columns.forEach((col, i) => columnAlignments.set(i, parseColumnAlignment(col)));
                    break;

                default: // Remaining rows
                    columns.forEach((col, i) => {
                        const existingLength = columnSpanLengths.get(i) || 0;
                        const currentLength = measureColumnSpan(col);
                        if (!!existingLength && currentLength > existingLength) {
                            columnSpanLengths.set(i, currentLength);
                        }
                    });
                    break;
            }
        });

        const replacements: Array<{ selection: Selection, value: string }> = [];
        for (const [pair, selection] of this.lines) {
            const { index, line } = pair;
            const isAlignmentRow = index === 1;
            const columns = line.split("|");
            const isLastIteration = (i: number, array: string[]) => {
                return i === array.length - 1;
            };

            let value = "";
            for (let i = 0; i < columns.length; ++i) {
                const column = columns[i];
                if (isFirstColumnSpace) {
                    value += column;
                    continue;
                }

                const padding = columnSpanLengths.get(i) || 0;
                const isLastColumn = isLastIteration(i, columns);
                if (isAlignmentRow) {
                    const columnAlignment = columnAlignments.get(i) || ColumnAlignment.None;
                    switch (columnAlignment) {
                        case ColumnAlignment.Center:
                            value += `|:${"".padEnd(padding - 2, "-")}:`;
                            if (isLastColumn) {
                                value += " |";
                            }
                            break;
                    }
                    continue;
                }

                value += `| ${column.padEnd(padding)} `;
                if (isLastColumn) {
                    value += " |";
                }
            }

            replacements.push({ selection, value });
        }

        await editor.edit((builder) => {
            replacements.forEach((replacement) =>
                builder.replace(
                    replacement.selection,
                    replacement.value));
        });
    }
}
