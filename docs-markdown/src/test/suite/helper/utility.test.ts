import * as chai from "chai";
import * as utility from "../../../helper/utility";

const expect = chai.expect;

suite("Utility helper class", () => {
    test("inferLanguageFromFileExtension returns null when not found", () => {
        const lang = utility.inferLanguageFromFileExtension(".foobar");
        expect(lang).to.be.equal(null);
    });

    test("inferLanguageFromFileExtension returns correct language when found", () => {
        const lang = utility.inferLanguageFromFileExtension(".ts");
        expect(lang ? lang.language : "").to.be.equal("TypeScript");
    });
    test("videoLinkBuilder returns triple colon video", () => {
        const videoLink = utility.videoLinkBuilder("https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player");
        expect(videoLink).to.be.equal(`:::video source="https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player":::`);
    });
});
