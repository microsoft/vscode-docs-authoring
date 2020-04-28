import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window, Uri } from "vscode";
import { deleteEmptyMetadata, deleteNaMetadata, deleteCommentedMetadata } from "../../../../controllers/cleanup/removeEmptyMetadata";
import * as removeEmptyMetadata from "../../../../controllers/cleanup/removeEmptyMetadata";
import * as cleanup from "../../../../controllers/cleanup/cleanup-controller";
import * as common from "../../../../helper/common";
import * as telemetry from "../../../../helper/telemetry";

chai.use(spies);

const sinon = require("sinon");
const expect = chai.expect;
const testString = `---
title: "Remove empty metadata markdown testing document" 
ms.naValue: na
ms.nsaValue: n/a
#ms.commented: "comment"
ms.list:
    - "some value"
    - "another value"
ms.listWEmpty:
    - ""
    - "real value"
    -
ms.empty:
ms.singleQuote: ''
ms.doubleQuote: ""
ms.realValue: "Hello World"
---
`

suite("Remove Empty Metadata Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });
    test("Remove Empty Metadata - Cleanup Controller", async () => {
        const filePath = resolve(__dirname, "../../../../../../src/test/data/repo/articles/docs-markdown.md");
        const docUri = Uri.file(filePath);
        const qpSelectionItems = [
            { "label": "Empty metadata" },
            { "label": "Remove all" }
        ]
        var counter = 0;
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[counter++]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        await cleanup.applyCleanupFile(docUri);
        expect(spy).to.have.been.called();
        stub.restore();

    });
    test("Delete Empty Metadata", async () => {
        const cleanedString = deleteEmptyMetadata(testString);
        const expectedString = `---
title: "Remove empty metadata markdown testing document" 
ms.naValue: na
ms.nsaValue: n/a
#ms.commented: "comment"
ms.list:
    - "some value"
    - "another value"
ms.listWEmpty:
    - "real value"
ms.realValue: "Hello World"
---
`
        expect(cleanedString).to.equal(expectedString);
    });
    test("Delete N/A Metadata", async () => {
        const cleanedString = deleteNaMetadata(testString);
        const expectedString = `---
title: "Remove empty metadata markdown testing document" 
#ms.commented: "comment"
ms.list:
    - "some value"
    - "another value"
ms.listWEmpty:
    - ""
    - "real value"
    -
ms.empty:
ms.singleQuote: ''
ms.doubleQuote: ""
ms.realValue: "Hello World"
---
`
        expect(cleanedString).to.equal(expectedString);
    });
    test("Delete Commented Metadata", async () => {
        const cleanedString = deleteCommentedMetadata(testString);
        const expectedString = `---
title: "Remove empty metadata markdown testing document" 
ms.naValue: na
ms.nsaValue: n/a
ms.list:
    - "some value"
    - "another value"
ms.listWEmpty:
    - ""
    - "real value"
    -
ms.empty:
ms.singleQuote: ''
ms.doubleQuote: ""
ms.realValue: "Hello World"
---
`
        expect(cleanedString).to.equal(expectedString);
    });

});