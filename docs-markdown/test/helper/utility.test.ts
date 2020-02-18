// import { inferLanguageFromFileExtension } from "../../src/helper/utility";

// /*
//     tslint:disable:no-unused-expression
//     tslint:disable-next-line: object-literal-sort-keys
// */

describe("Utility helper class", () => {
    it("placeholder test", () => {
        expect(true).toBeTruthy();
    });
});

// describe("Utility helper class", () => {
//     describe("inferLanguageFromFileExtension,", () => {
//         it("returns null when not found.", () => {
//             const lang = inferLanguageFromFileExtension(".foobar");
//             expect(lang).toBeNull();
//         });

//         it("returns correct language when found.", () => {
//             let lang = inferLanguageFromFileExtension(".ts");
//             expect(lang).toBeTruthy();
//             expect(lang ? lang.language : "").toBe("TypeScript");

//             lang = inferLanguageFromFileExtension(".cs");
//             expect(lang).toBeTruthy();
//             expect(lang ? lang.language : "").toBe("C#");
//         });
//     });
// });
