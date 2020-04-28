import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window, Uri } from "vscode";
import * as cleanup from "../../../../controllers/cleanup/cleanup-controller";
import * as common from "../../../../helper/common";
import * as handleSingleValuedMetadata from "../../../../controllers/cleanup/handleSingleValuedMetadata";
import * as telemetry from "../../../../helper/telemetry";
import { singleValueMetadata } from "../../../../controllers/cleanup/utilities";

chai.use(spies);

const sinon = require("sinon");
const expect = chai.expect;

suite("Single-Value Metadata Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });
    test("Single-Value Metadata - Cleanup Controller", async () => {
        const filePath = resolve(__dirname, "../../../../../../src/test/data/repo/articles/docs-markdown.md");
        const docUri = Uri.file(filePath);

        const qpSelectionItems = [
            { "label": "Single-valued metadata" }
        ]
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(handleSingleValuedMetadata, "handleSingleValuedMetadata");
        await cleanup.applyCleanupFile(docUri);
        expect(spy).to.be.called()
        stub.restore();
    });
    test("Single-Value Empty List Metadata Cleanup", async () => {
        // Testing empty single value list handling
        const testString = `ms.custom:
  - ""`
        const cleanedString = singleValueMetadata(testString, "ms.custom");
        expect(cleanedString).to.equal("ms.custom: \"\"");
    });
    test("Single-Value List Metadata Cleanup", async () => {
        // Testing single value list handling
        const testString = `ms.custom:
  - "test_value"`
        const cleanedString = singleValueMetadata(testString, "ms.custom");
        expect(cleanedString).to.equal("ms.custom: \"test_value\"");
    });
});