import * as chai from "chai";
import * as utility from "../../../helper/utility";

const expect = chai.expect;

suite("Utility helper class", () => {
    test("inferLanguageFromFileExtension returns null when not found", () => {
        const lang = utility.inferLanguageFromFileExtension(".foobar");
        expect(lang).to.be.null("The .foobar extension shouldn't infer a language.");
    });

    test("inferLanguageFromFileExtension returns correct language when found", () => {
        const lang = utility.inferLanguageFromFileExtension(".ts");
        expect(lang ? lang.language : "").to.be("TypeScript");
    });
});
