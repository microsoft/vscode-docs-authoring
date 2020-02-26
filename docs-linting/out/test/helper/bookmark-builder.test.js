"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookmark_builder_1 = require("../../src/helper/bookmark-builder");
/* tslint:disable:no-unused-expression */
describe("Bookmark style testing,", () => {
    const pathSelection = `bookmarks.md`;
    const selectedText = `Test 1`;
    const simpleHeading = `## Windows`;
    const simpleHeadingExpected = `[${selectedText}](bookmarks.md#windows)`;
    const extraSpacesInHeading = `##    Windows`;
    const extraSpacesInHeadingExpected = `[${selectedText}](bookmarks.md#windows)`;
    const underscoresInHeading = `## Windows_Mac_Linux`;
    const underscoresInHeadingExpected = `[${selectedText}](bookmarks.md#windows_mac_linux)`;
    describe("bookmarkBuilder function", () => {
        it("format a simple heading (no extra spaces or underscores).", () => {
            expect(bookmark_builder_1.bookmarkBuilder(selectedText, simpleHeading, pathSelection)).toBe(simpleHeadingExpected);
        });
        it("format a heading with additional spaces.", () => {
            expect(bookmark_builder_1.bookmarkBuilder(selectedText, extraSpacesInHeading, pathSelection)).toBe(extraSpacesInHeadingExpected);
        });
        it("format a heading with underscores.", () => {
            expect(bookmark_builder_1.bookmarkBuilder(selectedText, underscoresInHeading, pathSelection)).toBe(underscoresInHeadingExpected);
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
//# sourceMappingURL=bookmark-builder.test.js.map