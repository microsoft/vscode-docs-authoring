import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { window, commands } from "vscode";
import { insertMoniker, insertMonikerCommand } from "../../../controllers/moniker-controller";
import * as telemetry from "../../../helper/telemetry";
import * as common from "../../../helper/common";


import { sleep, loadDocumentAndGetItReady } from "../../test.common/common";

chai.use(spies);
const sinon = require("sinon");

const expect = chai.expect;

const moniker_options = [
    "range equals",
    "range greater than or equal",
    "range less than or equal",
];

const sleep_time = 100;

suite("Moniker Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
        chai.spy.restore(window);

    });
    suiteTeardown(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    test("insertMonikerCommand", () => {
        const controllerCommands = [
            { command: insertMoniker.name, callback: insertMoniker },
        ];
        expect(insertMonikerCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        insertMoniker();
        expect(spy).to.have.been.called();
    });

    test("isMarkdownFileCheck", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/bookmark.md");
        await loadDocumentAndGetItReady(filePath);
        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        insertMoniker();
        await sleep(sleep_time);
        expect(spy).to.have.been.called();
    });

    test("isContentOnCurrentLine", async () => {

        const spy = chai.spy.on(window, "showErrorMessage");
        insertMoniker();
        await sleep(sleep_time);
        expect(spy).to.have.been.called();

    });


    const yaml_line = 10;
    const yaml_character = 15;
    test("insertYamlMoniker - equal - output", async () => {


        const spy = chai.spy.on(common, "setCursorPosition");
        const spy2 = chai.spy.on(common, "insertContentToEditor");
        const editor = window.activeTextEditor;
        spy(editor, 10, 0);
        spy2(editor, "test", "\r\n");
        spy(editor, 10, 0);
        spy2(editor, "test", "", true);
        await sleep(sleep_time);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(10).text;
        stub.restore();
        expect(output).to.equal("monikerRange: ''");

    });

    test("insertYamlMoniker - equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character]);

    });



    test("insertYamlMoniker - greater/equal - output", async () => {


        const spy = chai.spy.on(common, "setCursorPosition");
        const spy2 = chai.spy.on(common, "insertContentToEditor");
        const editor = window.activeTextEditor;
        spy(editor, 10, 0);
        spy2(editor, "test", "\r\n");
        spy(editor, 10, 0);
        spy2(editor, "test", "", true);
        await sleep(sleep_time);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[1]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(10).text;
        stub.restore();
        expect(output).to.equal("monikerRange: '>='");

    });

    test("insertYamlMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character + 2]);

    });




    test("insertYamlMoniker - less/equal - output", async () => {


        const spy = chai.spy.on(common, "setCursorPosition");
        const spy2 = chai.spy.on(common, "insertContentToEditor");
        const editor = window.activeTextEditor;
        spy(editor, 10, 0);
        spy2(editor, "test", "\r\n");
        spy(editor, 10, 0);
        spy2(editor, "test", "", true);
        await sleep(sleep_time);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[2]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(10).text;
        stub.restore();
        expect(output).to.equal("monikerRange: '<='");

    });

    test("insertYamlMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character + 2]);

    });




    const mark_line = yaml_line + 4;
    const mark_character = 19;

    test("insertMarkdownMoniker - equal - output", async () => {
        const spy = chai.spy.on(common, "setCursorPosition");
        const editor = window.activeTextEditor;
        spy(editor, mark_line, 0);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(mark_line).text;

        stub.restore();
        expect(output).to.equal("::: moniker range=\"\"");

    });

    test("insertMarkdownMoniker - equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([mark_line, mark_character]);

    });



    test("insertMarkdownMoniker - greater/equal - output", async () => {
        const spy = chai.spy.on(common, "setCursorPosition");
        const spy2 = chai.spy.on(common, "insertContentToEditor");

        const editor = window.activeTextEditor;
        spy(editor, mark_line + 3, 0);
        spy2(editor, "test", "\r\n");
        spy(editor, mark_line + 3, 0);
        spy2(editor, "test", "", true);
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[1]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(mark_line + 3).text;

        stub.restore();
        expect(output).to.equal("::: moniker range=\">=\"");

    });

    test("insertMarkdownMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([mark_line + 3, mark_character + 2]);

    });




    test("insertMarkdownMoniker - less/equal - output", async () => {
        const spy = chai.spy.on(common, "setCursorPosition");
        const spy2 = chai.spy.on(common, "insertContentToEditor");

        const editor = window.activeTextEditor;
        spy(editor, mark_line + 6, 0);
        spy2(editor, "test", "\r\n");
        spy(editor, mark_line + 6, 0);
        spy2(editor, "test", "", true);
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[2]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(mark_line + 6).text;

        stub.restore();
        expect(output).to.equal("::: moniker range=\"<=\"");

    });

    test("insertMarkdownMoniker - less/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;

        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([mark_line + 6, mark_character + 2]);

    });




});