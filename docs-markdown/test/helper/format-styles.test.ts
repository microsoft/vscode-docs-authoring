import { isBold, isBoldAndItalic, isInlineCode, isItalic, isMultiLineCode, bold } from "../../src/helper/format-styles";

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

    describe("format function", () => {

        const singleLineString = `This is single line of sample text.`;
        const multilineString = `This is sample text.\r\nIt has multiplelines in it.`;
        const nestedItalic = "This is sample text *there\r\nis nested italic* in this block.";
        const nestedCode = "`This is sample text in a markdown code block.`";
        const nestedCodeBlock = "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";

        it("Should toggle bold with single line text.", () => {

            const bolded = bold(singleLineString);

            expect(bolded).toBe(`**${singleLineString}**`);
            expect(bold(bolded)).toBe(singleLineString);
        });

        it("Should toggle bold with multiline text.", () => {

            const bolded = bold(multilineString);

            expect(bolded).toBe(`**${multilineString}**`);
            expect(bold(bolded)).toBe(multilineString);
        });

        it("Should toggle bold without effecting italic/code formatting", () => {

            const boldedItalic = bold(nestedItalic);
            const boldedCode = bold(nestedCode);
            const boldedCodeBlock = bold(nestedCodeBlock);

            expect(boldedItalic).toBe(`**${nestedItalic}**`);
            expect(bold(boldedItalic)).toBe(nestedItalic);
            expect(boldedCode).toBe(`**${nestedCode}**`);
            expect(bold(boldedCode)).toBe(nestedCode);
            expect(boldedCodeBlock).toBe(`**${nestedCodeBlock}**`);
            expect(bold(boldedCodeBlock)).toBe(nestedCodeBlock);
        });
    });
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
