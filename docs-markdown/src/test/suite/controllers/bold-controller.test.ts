import * as assert from "assert";
import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands } from "vscode";
import { bold, boldFormattingCommand, formatBold } from "../../../controllers/bold-controller";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep } from "../../test.common/common";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");

const expect = chai.expect;

suite("Bold Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });

    test("boldFormattingCommand", () => {
        const controllerCommands = [
            { command: formatBold.name, callback: formatBold },
        ];
        expect(boldFormattingCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        formatBold();
        expect(spy).to.have.been.called();
    });
    test("isMarkdownFileCheck", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        formatBold();
        await sleep(300);
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("insertContentToEditor - no selection", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        const stub = sinon.stub(telemetry, "sendTelemetryData");
        const spy = chai.spy.on(common, "insertContentToEditor");
        formatBold();
        await sleep(500);
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("insertContentToEditor - multiple cursors", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        await commands.executeCommand("cursorMove", {
            by: "line",
            to: "down",
            value: 14,
        });

        await commands.executeCommand("cursorMove", {
            by: "character",
            select: true,
            to: "right",
            value: 8,
        });

        await commands.executeCommand("editor.action.insertCursorBelow");

        const stub = sinon.stub(telemetry, "sendTelemetryData");
        formatBold();
        stub.restore();
    });
    test("bold()", async () => {
        const result = bold("good");
        assert.equal(result, "**good**");
    });
});
