import { isBold, isItalic, isBoldAndItalic, isInlineCode, isMultiLineCode } from '../../src/helper/format-styles';
import { expect } from 'chai';

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

            expect(isInlineCode(inlineCode)).to.be.true;
            expect(isInlineCode(multilineCode)).to.be.true;
        });

        it("returns false if there is no inline code formatting in the text.", () => {

            expect(isInlineCode(bolded)).to.be.false;
            expect(isInlineCode(mulitlineBolded)).to.be.false;
            expect(isInlineCode(italized)).to.be.false;
            expect(isInlineCode(italizedMultiline)).to.be.false;
            expect(isInlineCode(non)).to.be.false;
            expect(isInlineCode(nonMultiline)).to.be.false;
        });
    });

    describe("isMultilineCode function", () => {

        it("returns true if text is a code block.", () => {

            expect(isMultiLineCode(multilineCode)).to.be.true;
        });

        it("returns false if there is no code block.", () => {

            expect(isMultiLineCode(bolded)).to.be.false;
            expect(isMultiLineCode(mulitlineBolded)).to.be.false;
            expect(isMultiLineCode(italized)).to.be.false;
            expect(isMultiLineCode(italizedMultiline)).to.be.false;
            expect(isMultiLineCode(non)).to.be.false;
            expect(isMultiLineCode(nonMultiline)).to.be.false;
        });
    });


    describe("isBold function", () => {

        it("returns true if text is bold in any way.", () => {

            expect(isBold(bolded)).to.be.true;
            expect(isBold(mulitlineBolded)).to.be.true;
        });

        it("returns false if there is no bold formatting in the text.", () => {

            expect(isBold(italized)).to.be.false;
            expect(isBold(non)).to.be.false;
            expect(isBold(italizedMultiline)).to.be.false;
            expect(isBold(nonMultiline)).to.be.false;
        });

    });

    describe("isItalic function", () => {

        it("returns true if text is italic in any way.", () => {

            expect(isItalic(italized)).to.be.true;
            expect(isItalic(italizedMultiline)).to.be.true;
        });

        it("returns false if there is no italic formatting in the text.", () => {

            expect(isItalic(bolded)).to.be.false;
            expect(isItalic(mulitlineBolded)).to.be.false;
            expect(isItalic(non)).to.be.false;
            expect(isItalic(nonMultiline)).to.be.false;
        });

        it("return true if the text is both bold and italic", () => {

            expect(isItalic(boldAndItalic)).to.be.true;
            expect(isItalic(boldAndItalicMultiline)).to.be.true;
        });
    });

    describe("isBoldAndItalic function", () => {

        it("returns true if text is both bold and italic.", () => {

            expect(isBoldAndItalic(boldAndItalic)).to.be.true;
            expect(isBoldAndItalic(boldAndItalicMultiline)).to.be.true;
        });

        it("returns false the text is only bold", () => {

            expect(isBoldAndItalic(bolded)).to.be.false;
            expect(isBoldAndItalic(mulitlineBolded)).to.be.false;
        });

        it("returns false the text is only italic", () => {

            expect(isBoldAndItalic(italized)).to.be.false;
            expect(isBoldAndItalic(italizedMultiline)).to.be.false;
        });

        it("returns false the text is not formatted", () => {

            expect(isBoldAndItalic(non)).to.be.false;
            expect(isBoldAndItalic(nonMultiline)).to.be.false;
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