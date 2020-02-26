"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_styles_1 = require("../../src/helper/format-styles");
describe("Bold controller", () => {
    describe("format function", () => {
        const singleLineString = `This is single line of sample text.`;
        const multilineString = `This is sample text.\r\nIt has multiplelines in it.`;
        const nestedItalic = "This is sample text *there\r\nis nested italic* in this block.";
        const nestedCode = "`This is sample text in a markdown code block.`";
        const nestedCodeBlock = "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";
        it("Should toggle bold with single line text.", () => {
            const bolded = format_styles_1.bold(singleLineString);
            expect(bolded).toBe(`**${singleLineString}**`);
            expect(format_styles_1.bold(bolded)).toBe(singleLineString);
        });
        it("Should toggle bold with multiline text.", () => {
            const bolded = format_styles_1.bold(multilineString);
            expect(bolded).toBe(`**${multilineString}**`);
            expect(format_styles_1.bold(bolded)).toBe(multilineString);
        });
        it("Should toggle bold without effecting italic/code formatting", () => {
            const boldedItalic = format_styles_1.bold(nestedItalic);
            const boldedCode = format_styles_1.bold(nestedCode);
            const boldedCodeBlock = format_styles_1.bold(nestedCodeBlock);
            expect(boldedItalic).toBe(`**${nestedItalic}**`);
            expect(format_styles_1.bold(boldedItalic)).toBe(nestedItalic);
            expect(boldedCode).toBe(`**${nestedCode}**`);
            expect(format_styles_1.bold(boldedCode)).toBe(nestedCode);
            expect(boldedCodeBlock).toBe(`**${nestedCodeBlock}**`);
            expect(format_styles_1.bold(boldedCodeBlock)).toBe(nestedCodeBlock);
        });
    });
});
//# sourceMappingURL=bold-controller.test.js.map