import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { window, commands, TextEditor } from "vscode";
import { insertMoniker, insertMonikerCommand } from "../../../controllers/moniker-controller";
import * as telemetry from "../../../helper/telemetry";
import * as common from "../../../helper/common";
import { sleep, loadDocumentAndGetItReady } from "../../test.common/common";

chai.use(spies);
const sinon = require("sinon");
const expect = chai.expect;

function insert_blank_line(editor: TextEditor, line: number) {

    const spy = chai.spy.on(common, "insertContentToEditor");
    spy(editor, "test", "\r\n");
    chai.spy.restore(spy);

}
function move_cursor(editor: TextEditor, y: number, x: number) {

    const spy = chai.spy.on(common, "setCursorPosition");
    spy(editor, y, x);
    chai.spy.restore(spy);


}

const test_file = "../../../../../src/test/data/repo/articles/bookmark.md";
const sleep_time = 100;
const moniker_options = [
    "range equals",
    "range greater than or equal",
    "range less than or equal",
];

//line ( y coord) , character (x coord)
const yaml_line = 10;
const yaml_character = 15;
const mark_line = yaml_line + 4;
const mark_character = 19;


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
        const filePath = resolve(__dirname, test_file);
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


    // YAML Header test
    test("insertYamlMoniker - equal - output", async () => {

        const editor = window.activeTextEditor;
        move_cursor(editor!, yaml_line, 0);
        insert_blank_line(editor!, yaml_line);
        move_cursor(editor!, yaml_line, 0); //move cursor back
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(yaml_line).text;
        stub.restore();

        expect(output).to.equal("monikerRange: ''");

    });

    test("insertYamlMoniker - equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];
        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character]);

    });

    test("insertYamlMoniker - greater/equal - output", async () => {

        const editor = window.activeTextEditor;
        move_cursor(editor!, yaml_line, 0);
        insert_blank_line(editor!, 10);
        move_cursor(editor!, yaml_line, 0);

        await sleep(sleep_time);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[1]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(yaml_line).text;
        stub.restore();

        expect(output).to.equal("monikerRange: '>='");

    });

    test("insertYamlMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character + 2]);

    });

    test("insertYamlMoniker - less/equal - output", async () => {


        const editor = window.activeTextEditor;
        move_cursor(editor!, yaml_line, 0);
        insert_blank_line(editor!, yaml_line);
        move_cursor(editor!, yaml_line, 0);
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[2]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const output = editor?.document.lineAt(yaml_line).text;
        stub.restore();

        expect(output).to.equal("monikerRange: '<='");

    });

    test("insertYamlMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([yaml_line, yaml_character + 2]);

    });



    // Markdown body test
    test("insertMarkdownMoniker - equal - output", async () => {
        const editor = window.activeTextEditor;
        move_cursor(editor!, mark_line, 0);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const line1 = editor?.document.lineAt(mark_line).text;
        const line2 = editor?.document.lineAt(mark_line + 1).text;
        const line3 = editor?.document.lineAt(mark_line + 2).text;
        const output = line1! + line2 + line3;
        stub.restore();

        expect(output).to.equal("::: moniker range=\"\"::: moniker-end");

    });

    test("insertMarkdownMoniker - equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([mark_line, mark_character]);

    });



    test("insertMarkdownMoniker - greater/equal - output", async () => {


        const editor = window.activeTextEditor;
        move_cursor(editor!, mark_line + 3, 0);
        insert_blank_line(editor!, mark_line + 3);
        move_cursor(editor!, mark_line + 3, 0);
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[1]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const line1 = editor?.document.lineAt(mark_line + 3).text;
        const line2 = editor?.document.lineAt(mark_line + 4).text;
        const line3 = editor?.document.lineAt(mark_line + 5).text;
        const output = line1! + line2 + line3;
        stub.restore();

        expect(output).to.equal("::: moniker range=\">=\"::: moniker-end");

    });

    test("insertMarkdownMoniker - greater/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

        expect(cursorPosition).to.deep.equal([mark_line + 3, mark_character + 2]);

    });

    test("insertMarkdownMoniker - less/equal - output", async () => {

        const editor = window.activeTextEditor;
        move_cursor(editor!, mark_line + 6, 0);
        insert_blank_line(editor!, mark_line + 3);
        move_cursor(editor!, mark_line + 6, 0);
        await sleep(sleep_time);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(moniker_options[2]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertMoniker();
        await sleep(sleep_time);
        const line1 = editor?.document.lineAt(mark_line + 6).text;
        const line2 = editor?.document.lineAt(mark_line + 7).text;
        const line3 = editor?.document.lineAt(mark_line + 8).text;
        const output = line1! + line2 + line3;
        stub.restore();

        expect(output).to.equal("::: moniker range=\"<=\"::: moniker-end");

    });

    test("insertMarkdownMoniker - less/equal - cursorPosition", async () => {

        const editor = window.activeTextEditor;
        const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];
        expect(cursorPosition).to.deep.equal([mark_line + 6, mark_character + 2]);

    });




});