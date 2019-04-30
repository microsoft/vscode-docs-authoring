import { bold } from "../../src/helper/format-styles";

describe("Bold controller", () => {
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
});
