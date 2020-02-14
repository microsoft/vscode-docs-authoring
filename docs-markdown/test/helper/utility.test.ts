import { inferLanguageFromFileExtension } from "../../src/helper/utility";

/*
    tslint:disable:no-unused-expression
    tslint:disable-next-line: object-literal-sort-keys
*/

describe("Utility helper class", () => {
    describe("inferLanguageFromFileExtension,", () => {
        it("returns null when not found.", () => {
            expect(inferLanguageFromFileExtension(".foobar")).toBeNull();
        });

        it("returns correct language when found.", () => {
            const lang = inferLanguageFromFileExtension(".ts");
            expect(lang).toBeTruthy();
            expect(lang ? lang.language : "").toBe("TypeScript");
        });
    });
});
