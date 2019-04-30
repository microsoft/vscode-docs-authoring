import { makeBold } from "../../src/helper/format-styles";

describe("Bold controller", () => {
    describe("format function", () => {

        const singleLineString = `This is single line of sample text.`;
        const multilineString = `This is sample text.\r\nIt has multiplelines in it.`;
        const nestedItalic = "This is sample text *there\r\nis nested italic* in this block.";
        const nestedCode = "`This is sample text in a markdown code block.`";
        const nestedCodeBlock = "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";

        it("Should toggle bold with single line text.", () => {

            const bolded = makeBold(singleLineString);

            expect(bolded).toBe(`**${singleLineString}**`);
            expect(makeBold(bolded)).toBe(singleLineString);
        });

        it("Should toggle bold with multiline text.", () => {

            const bolded = makeBold(multilineString);

            expect(bolded).toBe(`**${multilineString}**`);
            expect(makeBold(bolded)).toBe(multilineString);
        });

        it("Should toggle bold without effecting italic/code formatting", () => {

            const boldedItalic = makeBold(nestedItalic);
            const boldedCode = makeBold(nestedCode);
            const boldedCodeBlock = makeBold(nestedCodeBlock);

            expect(boldedItalic).toBe(`**${nestedItalic}**`);
            expect(makeBold(boldedItalic)).toBe(nestedItalic);
            expect(boldedCode).toBe(`**${nestedCode}**`);
            expect(makeBold(boldedCode)).toBe(nestedCode);
            expect(boldedCodeBlock).toBe(`**${nestedCodeBlock}**`);
            expect(makeBold(boldedCodeBlock)).toBe(nestedCodeBlock);
        });
    });
});
