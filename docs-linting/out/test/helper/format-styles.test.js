"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_styles_1 = require("../../src/helper/format-styles");
/* tslint:disable:no-unused-expression */
describe("Format style type checking,", () => {
    const bolded = `**This is sample text in markdown bold format.**`;
    const mulitlineBolded = `**This is sample text in\r\nMarkdown bold format, multiline**`;
    const italized = `*This is sample text in\r\nMarkdown italic format, multiline*`;
    const italizedMultiline = `*This is sample text in markdown italic format.*`;
    const non = `This is sample text. Singleline, without formatting.`;
    const nonMultiline = `This is sample text.\r\nIt has multiplelines in it.`;
    const boldAndItalic = "***This is sample text in markdown bold format.***";
    const boldAndItalicMultiline = `***This is sample text in\r\nMarkdown bold format, multiline***`;
    const inlineCode = "`This is sample text in a markdown code block.`";
    const multilineCode = "```\nThis is sample text in a markdown multiline code block.\n```\n";
    describe("isInlineCode function", () => {
        it("returns true if text is inline code in any way.", () => {
            expect(format_styles_1.isInlineCode(inlineCode)).toBe(true);
            expect(format_styles_1.isInlineCode(multilineCode)).toBe(true);
        });
        it("returns false if there is no inline code formatting in the text.", () => {
            expect(format_styles_1.isInlineCode(bolded)).toBe(false);
            expect(format_styles_1.isInlineCode(mulitlineBolded)).toBe(false);
            expect(format_styles_1.isInlineCode(italized)).toBe(false);
            expect(format_styles_1.isInlineCode(italizedMultiline)).toBe(false);
            expect(format_styles_1.isInlineCode(non)).toBe(false);
            expect(format_styles_1.isInlineCode(nonMultiline)).toBe(false);
        });
    });
    describe("isMultilineCode function", () => {
        it("returns true if text is a code block.", () => {
            expect(format_styles_1.isMultiLineCode(multilineCode)).toBe(true);
        });
        it("returns false if there is no code block.", () => {
            expect(format_styles_1.isMultiLineCode(bolded)).toBe(false);
            expect(format_styles_1.isMultiLineCode(mulitlineBolded)).toBe(false);
            expect(format_styles_1.isMultiLineCode(italized)).toBe(false);
            expect(format_styles_1.isMultiLineCode(italizedMultiline)).toBe(false);
            expect(format_styles_1.isMultiLineCode(non)).toBe(false);
            expect(format_styles_1.isMultiLineCode(nonMultiline)).toBe(false);
        });
    });
    describe("isBold function", () => {
        it("returns true if text is bold in any way.", () => {
            expect(format_styles_1.isBold(bolded)).toBe(true);
            expect(format_styles_1.isBold(mulitlineBolded)).toBe(true);
        });
        it("returns false if there is no bold formatting in the text.", () => {
            expect(format_styles_1.isBold(italized)).toBe(false);
            expect(format_styles_1.isBold(non)).toBe(false);
            expect(format_styles_1.isBold(italizedMultiline)).toBe(false);
            expect(format_styles_1.isBold(nonMultiline)).toBe(false);
        });
    });
    describe("isItalic function", () => {
        it("returns true if text is italic in any way.", () => {
            expect(format_styles_1.isItalic(italized)).toBe(true);
            expect(format_styles_1.isItalic(italizedMultiline)).toBe(true);
        });
        it("returns false if there is no italic formatting in the text.", () => {
            expect(format_styles_1.isItalic(bolded)).toBe(false);
            expect(format_styles_1.isItalic(mulitlineBolded)).toBe(false);
            expect(format_styles_1.isItalic(non)).toBe(false);
            expect(format_styles_1.isItalic(nonMultiline)).toBe(false);
        });
        it("return true if the text is both bold and italic", () => {
            expect(format_styles_1.isItalic(boldAndItalic)).toBe(true);
            expect(format_styles_1.isItalic(boldAndItalicMultiline)).toBe(true);
        });
    });
    describe("isBoldAndItalic function", () => {
        it("returns true if text is both bold and italic.", () => {
            expect(format_styles_1.isBoldAndItalic(boldAndItalic)).toBe(true);
            expect(format_styles_1.isBoldAndItalic(boldAndItalicMultiline)).toBe(true);
        });
        it("returns false the text is only bold", () => {
            expect(format_styles_1.isBoldAndItalic(bolded)).toBe(false);
            expect(format_styles_1.isBoldAndItalic(mulitlineBolded)).toBe(false);
        });
        it("returns false the text is only italic", () => {
            expect(format_styles_1.isBoldAndItalic(italized)).toBe(false);
            expect(format_styles_1.isBoldAndItalic(italizedMultiline)).toBe(false);
        });
        it("returns false the text is not formatted", () => {
            expect(format_styles_1.isBoldAndItalic(non)).toBe(false);
            expect(format_styles_1.isBoldAndItalic(nonMultiline)).toBe(false);
        });
    });
});
// // for posterity
// describe("Module", () => {
//     describe("funcName function", () => {
//         it("does whatever this function should do.", () => {
//          const testVar = '';
//             expect(funcName(testVar)).to.be.false;
//         })
//     });
// });
//# sourceMappingURL=format-styles.test.js.map