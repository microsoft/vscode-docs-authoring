import * as chai from "chai";
import * as spies from "chai-spies";
import { RedirectUrl } from "../../../controllers/master-redirect-controller";

chai.use(spies);

const expect = chai.expect;

suite("Master Redirect Controller", () => {
    const options = {
        docsetName: "azure",
        docsetRootFolderName: "articles",
    };

    test("RedirectUrl parse fully qualified URL", () => {
        const url = "https://docs.microsoft.com/azure/subject/file";
        const redirectUrl = RedirectUrl.parse(options, url);

        expect(redirectUrl!.filePath).to.equal("articles/subject/file.md");
        expect(redirectUrl!.toUrl()).to.equal("/azure/subject/file");
    });

    test("RedirectUrl parse relative standard path", () => {
        const url = "/azure/subject/file";
        const redirectUrl = RedirectUrl.parse(options, url);

        expect(redirectUrl!.filePath).to.equal("articles/subject/file.md");
        expect(redirectUrl!.toUrl()).to.equal(url);
    });

    test("RedirectUrl parse handles hash tag", () => {
        const url = "https://docs.microsoft.com/azure/subject/file#bookmark";
        const redirectUrl = RedirectUrl.parse(options, url);

        expect(redirectUrl!.filePath).to.equal("articles/subject/file.md");
        expect(redirectUrl!.toUrl()).to.equal("/azure/subject/file");
        expect(redirectUrl!.url.hash).to.equal("#bookmark");
    });

    test("RedirectUrl parse handles query strings", () => {
        const url = "https://docs.microsoft.com/azure/subject/file?pivot=lang-csharp";
        const redirectUrl = RedirectUrl.parse(options, url);

        expect(redirectUrl!.filePath).to.equal("articles/subject/file.md");
        expect(redirectUrl!.toUrl()).to.equal("/azure/subject/file");
        expect(redirectUrl!.url.search).to.equal("?pivot=lang-csharp");
    });
});
