import { Selection, TextDocument, TextEditor } from "vscode";

enum ColumnAlignment {
    None,
    Left,
    Center,
    Right,
}

export enum FormatOptions {
    Distribute,
    Consolidate,
}

export class MarkdownTable {
    public static parse(selection: Selection, document: TextDocument): MarkdownTable | null {
        if (!selection || selection.isSingleLine || !document) {
            return null;
        }

        const parseLines = (s: Selection): string[] => {
            const startLine = selection.start.line;
            const endLine = selection.end.line;
            const lines: string[] = [];
            for (let line = startLine; line <= endLine; ++line) {
                lines.push(document.lineAt(line).text);
            }
            return lines;
        };

        return new MarkdownTable(selection, parseLines(selection));
    }

    private readonly emojiRegex: RegExp =
        /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    private constructor(
        private readonly selection: Selection,
        private readonly lines: string[]) { }

    public async reformat(editor: TextEditor, formatOptions: FormatOptions = FormatOptions.Distribute) {
        let isFirstColumnSpace: boolean = false;
        const columnSpanLengths = new Map<number, number>();
        const columnAlignments = new Map<number, ColumnAlignment>();

        this.lines.forEach((line, index, _) => {
            const columns = this.parseTableRow(line);
            switch (index) {
                case 0: // Table headings
                    const columnZero = columns[0];
                    isFirstColumnSpace = columnZero !== "" && this.measureColumnSpan(columnZero) === 0;
                    columns.forEach((col, i) => columnSpanLengths.set(i, this.measureColumnSpan(col)));
                    break;
                case 1: // Column formatting
                    columns.forEach((col, i) => columnAlignments.set(i, this.parseColumnAlignment(col)));
                    break;

                default: // Remaining rows
                    columns.forEach((col, i) => {
                        const existingLength = columnSpanLengths.has(i) ? columnSpanLengths.get(i) : -1;
                        const currentLength = this.measureColumnSpan(col);
                        if (existingLength !== -1 && currentLength > (existingLength || 0)) {
                            columnSpanLengths.set(i, currentLength);
                        }
                    });
                    break;
            }
        });

        const calculatePadding = formatOptions === FormatOptions.Distribute;
        const values: string[] = [];
        this.lines.forEach((line, index, _) => {
            const isAlignmentRow = index === 1;
            const columns = this.parseTableRow(line);
            const isLastIteration = (i: number, array: string[]) => {
                return i === array.length - 1;
            };

            let value = "";
            for (let i = 0; i < columns.length; ++i) {
                const column = columns[i].trim();
                if (i === 0 && isFirstColumnSpace) {
                    value += columns[i];
                    continue;
                }

                let padding = calculatePadding ? (columnSpanLengths.get(i) || 0) : 0;
                const isLastColumn = isLastIteration(i, columns);
                if (isAlignmentRow) {
                    const columnAlignment = columnAlignments.get(i) || ColumnAlignment.None;
                    switch (columnAlignment) {
                        case ColumnAlignment.Center:
                            value += `|:${"-".padEnd(padding, "-")}:`;
                            break;
                        case ColumnAlignment.Left:
                            value += `|:${"-".padEnd(padding + 1, "-")}`;
                            break;
                        case ColumnAlignment.Right:
                            value += `|${"-".padEnd(padding + 1, "-")}:`;
                            break;
                        case ColumnAlignment.None:
                            value += `|${"-".padEnd(padding + 2, "-")}`;
                            break;
                    }
                } else {
                    padding = padding - this.countEmoji(column);
                    value += `| ${column.padEnd(calculatePadding ? padding : 0)} `;
                }

                if (isLastColumn) {
                    value += "|";
                }
            }

            values.push(value);
        });

        await editor.edit((builder) => {
            builder.replace(this.selection, values.join("\n"));
        });
    }

    private measureColumnSpan(column: string) {
        const trimmed = column.trim();
        return Array.from(trimmed.split(/[\ufe00-\ufe0f]/).join("")).length;
    }

    private parseColumnAlignment(column: string) {
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
    }

    private parseTableRow(line: string): string[] {
        let columns = line.split("|");
        if (columns[0] === "") {
            columns = columns.slice(1);
        }
        if (columns[columns.length - 1] === "") {
            columns.pop();
        }

        return columns;
    }

    private countEmoji(value: string): number {
        if (value) {
            const result = this.emojiRegex.exec(value);
            return result ? result.length : 0;
        }

        return 0;
    }
}
