import { isBold, isBoldAndItalic, isInlineCode, isItalic, isMultiLineCode } from "../../src/helper/format-styles";

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

            expect(isInlineCode(inlineCode)).toBe(true);
            expect(isInlineCode(multilineCode)).toBe(true);
        });

        it("returns false if there is no inline code formatting in the text.", () => {

            expect(isInlineCode(bolded)).toBe(false);
            expect(isInlineCode(mulitlineBolded)).toBe(false);
            expect(isInlineCode(italized)).toBe(false);
            expect(isInlineCode(italizedMultiline)).toBe(false);
            expect(isInlineCode(non)).toBe(false);
            expect(isInlineCode(nonMultiline)).toBe(false);
        });
    });

    describe("isMultilineCode function", () => {

        it("returns true if text is a code block.", () => {

            expect(isMultiLineCode(multilineCode)).toBe(true);
        });

        it("returns false if there is no code block.", () => {

            expect(isMultiLineCode(bolded)).toBe(false);
            expect(isMultiLineCode(mulitlineBolded)).toBe(false);
            expect(isMultiLineCode(italized)).toBe(false);
            expect(isMultiLineCode(italizedMultiline)).toBe(false);
            expect(isMultiLineCode(non)).toBe(false);
            expect(isMultiLineCode(nonMultiline)).toBe(false);
        });
    });

    describe("isBold function", () => {

        it("returns true if text is bold in any way.", () => {

            expect(isBold(bolded)).toBe(true);
            expect(isBold(mulitlineBolded)).toBe(true);
        });

        it("returns false if there is no bold formatting in the text.", () => {

            expect(isBold(italized)).toBe(false);
            expect(isBold(non)).toBe(false);
            expect(isBold(italizedMultiline)).toBe(false);
            expect(isBold(nonMultiline)).toBe(false);
        });

    });

    describe("isItalic function", () => {

        it("returns true if text is italic in any way.", () => {

            expect(isItalic(italized)).toBe(true);
            expect(isItalic(italizedMultiline)).toBe(true);
        });

        it("returns false if there is no italic formatting in the text.", () => {

            expect(isItalic(bolded)).toBe(false);
            expect(isItalic(mulitlineBolded)).toBe(false);
            expect(isItalic(non)).toBe(false);
            expect(isItalic(nonMultiline)).toBe(false);
        });

        it("return true if the text is both bold and italic", () => {

            expect(isItalic(boldAndItalic)).toBe(true);
            expect(isItalic(boldAndItalicMultiline)).toBe(true);
        });
    });

    describe("isBoldAndItalic function", () => {

        it("returns true if text is both bold and italic.", () => {

            expect(isBoldAndItalic(boldAndItalic)).toBe(true);
            expect(isBoldAndItalic(boldAndItalicMultiline)).toBe(true);
        });

        it("returns false the text is only bold", () => {

            expect(isBoldAndItalic(bolded)).toBe(false);
            expect(isBoldAndItalic(mulitlineBolded)).toBe(false);
        });

        it("returns false the text is only italic", () => {

            expect(isBoldAndItalic(italized)).toBe(false);
            expect(isBoldAndItalic(italizedMultiline)).toBe(false);
        });

        it("returns false the text is not formatted", () => {

            expect(isBoldAndItalic(non)).toBe(false);
            expect(isBoldAndItalic(nonMultiline)).toBe(false);
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
