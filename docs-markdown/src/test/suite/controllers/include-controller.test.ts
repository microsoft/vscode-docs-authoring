import * as chai from "chai";
import * as spies from "chai-spies";
import { posix, resolve } from "path";
import { commands, TextEditor, window, workspace } from "vscode";
import { insertInclude, insertIncludeCommand } from "../../../controllers/include-controller";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep } from "../../test.common/common";

chai.use(spies);
// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");
const expect = chai.expect;

const root = workspace.workspaceFolders![0].uri;
const testFile = "../../../../../src/test/data/repo/articles/includes.md";
const sleepTime = 50;
const qpSelectionItems = [
    { description: root.fsPath + "\\includes", label: "1.md" },
    { description: root.fsPath + "\\includes", label: "2.md" },
    { description: root.fsPath + "\\includes", label: "3.md" },
];

// new line in current cursor position
function insertBlankLine(editor: TextEditor) {
    common.insertContentToEditor(editor, "test", "\r\n");
}
function moveCursor(editor: TextEditor, y: number, x: number) {
    common.setCursorPosition(editor, y, x);
}
// create incluldes folder
async function createIncludes() {
    const folder = root.with({ path: posix.join(root.path, "includes") });
    await workspace.fs.createDirectory(folder);
}
// delete includes folder and everything inside the folder
async function deleteIncludes() {
    const folder = root.with({ path: posix.join(root.path, "includes") });
    await workspace.fs.delete(folder, { recursive: true, useTrash: false });
}
async function addMarkdownFile(fileCount: number) {
    let filePath;
    while (fileCount > 0) {
        filePath = "includes/" + fileCount + ".md";
        const fileUri = root.with({ path: posix.join(root.path, filePath) });
        await workspace.fs.writeFile(fileUri, Buffer.from("# This is a include page " + fileCount));
        fileCount--;
    }
}
suite("Include Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
        chai.spy.restore(window);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });
    test("insertIncludeCommand", () => {
        const controllerCommands = [
            { command: insertInclude.name, callback: insertInclude },
        ];
        expect(insertIncludeCommand()).to.deep.equal(controllerCommands);
    });
    test("noActiveEditorMessage", () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        insertInclude();
        expect(spy).to.have.been.called();
    });
    test("isMarkdownFileCheck", async () => {
        const filePath = resolve(__dirname, testFile);
        await loadDocumentAndGetItReady(filePath);
        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve("") as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertInclude();
        await sleep(sleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("hasValidWorkSpaceRootPath", async () => {
        const spy = chai.spy.on(common, "hasValidWorkSpaceRootPath");
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve("") as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertInclude();
        await sleep(50);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("Window NT - includeOneFileEmptyLine", async () => {
        createIncludes();
        addMarkdownFile(3);
        const editor = window.activeTextEditor;
        moveCursor(editor!, 10, 0);
        insertBlankLine(editor!);
        moveCursor(editor!, 10, 0); // move cursor back
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertInclude();
        await sleep(sleepTime);
        const output = editor?.document.lineAt(10).text;
        stub.restore();
        expect(output).to.equal("[!INCLUDE [1](../includes/1.md)]");
    });
    test("Window NT - includeOneFileInline", async () => {
        const editor = window.activeTextEditor;
        moveCursor(editor!, 15, 8);
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertInclude();
        await sleep(sleepTime);
        const output = editor?.document.lineAt(15).text;
        stub.restore();
        expect(output).to.equal("Markdown[!INCLUDE [1](../includes/1.md)] is a lightweight markup language with plain text formatting syntax." +
            " Docs supports the CommonMark standard for Markdown, plus some custom Markdown extensions designed to provide richer content on docs.microsoft.com." +
            " This article provides an alphabetical reference for using Markdown for docs.microsoft.com.");
    });
    test("Window NT - includeMultipleFiles", async () => {
        const editor = window.activeTextEditor;
        moveCursor(editor!, 12, 0);
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
        };
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        insertInclude();
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[1]) as Thenable<any>;
        };
        insertInclude();
        await sleep(sleepTime);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[2]) as Thenable<any>;
        };
        insertInclude();
        await sleep(sleepTime);
        stub.restore();
        const output = editor?.document.lineAt(12).text;
        deleteIncludes();
        expect(output).to.equal("[!INCLUDE [1](../includes/1.md)][!INCLUDE [2](../includes/2.md)][!INCLUDE [3](../includes/3.md)]");
    });
});
