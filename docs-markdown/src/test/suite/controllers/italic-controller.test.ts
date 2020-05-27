import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window, Selection } from "vscode";
import { formatItalic, italicFormattingCommand } from "../../../controllers/italic-controller";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep, sleepTime } from "../../test.common/common";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");
const expect = chai.expect;

suite("Italic Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
        chai.spy.restore(window);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });
    test("ItalicFormattingCommand", () => {
        const controllerCommands = [
            { command: formatItalic.name, callback: formatItalic },
        ];
        expect(italicFormattingCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", async () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        await formatItalic();
        expect(spy).to.have.been.called();
    });
    test("isValidEditor", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        const spy = chai.spy.on(common, "isValidEditor");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        expect(spy).to.have.been.called();
    });
    test("isMarkdownFileCheck", async () => {
        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        expect(spy).to.have.been.called();
    });
    test("Italic Format Empty Selection", async () => {
        const editor = window.activeTextEditor;
        common.setSelectorPosition(editor!, 14, 0, 14, 0);
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        const output = editor?.document.lineAt(14).text;
        expect(output).to.equal("**");
    });
    test("Italic Format Single Selection", async () => {
        const editor = window.activeTextEditor;
        common.setSelectorPosition(editor!, 167, 0, 167, 1);
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        const output = editor?.document.lineAt(167).text;
        expect(output).to.equal("*B*ody");
    });
    test("Italic Format Word Selection", async () => {
        const editor = window.activeTextEditor;
        common.setSelectorPosition(editor!, 171, 0, 171, 4);
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        const line = editor?.document.lineAt(171).text;
        stub.restore();

        expect(line).to.equal("*Body*");
    });
    test("Italic Format Multiple Selection", async () => {
        const editor = window.activeTextEditor;
        const cursorPosition = editor!.selection.active;
        const fromPositionOne = cursorPosition.with(45, 2);
        const toPositionOne = cursorPosition.with(45, 11);
        const fromPositionTwo = cursorPosition.with(45, 20);
        const toPositionTwo = cursorPosition.with(45, 32);
        editor!.selections = [
            new Selection(fromPositionOne, toPositionOne),
            new Selection(fromPositionTwo, toPositionTwo)
        ];
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await formatItalic();
        stub.restore();
        await sleep(sleepTime);
        const line = editor?.document.lineAt(45).text;
        stub.restore();

        expect(line).to.equal("> *Dangerous* certain *consequences* of an action.");
    });
});
