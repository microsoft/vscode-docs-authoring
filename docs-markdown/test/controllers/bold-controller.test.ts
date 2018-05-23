import { expect } from "chai";
import { bold } from "../../src/controllers/bold-controller";

describe("Bold controller", () => {
    describe("format function", () => {

        const singleLineString = `This is single line of sample text.`;
        const multilineString = `This is sample text.\r\nIt has multiplelines in it.`;
        const nestedItalic = "This is sample text *there\r\nis nested italic* in this block.";
        const nestedCode = "`This is sample text in a markdown code block.`";
        const nestedCodeBlock = "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";

        it("Should toggle bold with single line text.", () => {

            const bolded = bold(singleLineString);

            expect(bolded).to.equal(`**${singleLineString}**`);
            expect(bold(bolded)).to.equal(singleLineString);
        });

        it("Should toggle bold with multiline text.", () => {

            const bolded = bold(multilineString);

            expect(bolded).to.equal(`**${multilineString}**`);
            expect(bold(bolded)).to.equal(multilineString);
        });

        it("Should toggle bold without effecting italic/code formatting", () => {

            const boldedItalic = bold(nestedItalic);
            const boldedCode = bold(nestedCode);
            const boldedCodeBlock = bold(nestedCodeBlock);

            expect(boldedItalic).to.equal(`**${nestedItalic}**`);
            expect(bold(boldedItalic)).to.equal(nestedItalic);
            expect(boldedCode).to.equal(`**${nestedCode}**`);
            expect(bold(boldedCode)).to.equal(nestedCode);
            expect(boldedCodeBlock).to.equal(`**${nestedCodeBlock}**`);
            expect(bold(boldedCodeBlock)).to.equal(nestedCodeBlock);
        });
    });
});
