import * as chai from "chai";
import * as spies from "chai-spies";
import { window, commands } from "vscode";
import * as common from "../../../helper/common";
import { insertBookmarkCommands, insertBookmarkExternal, insertBookmarkInternal } from "../../../controllers/bookmark-controller";
import { createDocumentAndGetItReady, sleep, loadDocumentAndGetItReady } from "../../test.common/common";
import * as telemetry from "../../../helper/telemetry";
import { resolve } from "path";

chai.use(spies);

const sinon = require("sinon");

const expect = chai.expect;

suite("Bookmark Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
        chai.spy.restore(window);
    });
    suiteTeardown(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    test("insertBookmarkCommands", () => {
        const controllerCommands = [
            { command: insertBookmarkExternal.name, callback: insertBookmarkExternal },
            { command: insertBookmarkInternal.name, callback: insertBookmarkInternal },
        ];
        expect(insertBookmarkCommands()).to.deep.equal(controllerCommands);
    });
    test("insertBookmarkExternal::noActiveEditorMessage", async () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        await insertBookmarkExternal();
        expect(spy).to.have.been.called();
    });
    test("insertBookmarkExternal::insertContentToEditor", async () => {
        await createDocumentAndGetItReady();
        const basePath = resolve(__dirname, "../../../../../")
        const qpSelectionItems = [
            { "label": "README.md", "description": `${basePath}\\src\\test\\data\\repo` },
            { "label": "## Getting Started\r\n", "detail": " " }
        ]
        var counter = 0;
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve(qpSelectionItems[counter++]) as Thenable<any>;
        };

        const stub = sinon.stub(telemetry, "sendTelemetryData");

        const spy = chai.spy.on(common, "insertContentToEditor");
        insertBookmarkExternal();
        await sleep(300);
        expect(spy).to.have.been.called();
        stub.restore();
    });
    test("insertBookmarkInternal::no headings", async () => {
        await createDocumentAndGetItReady();
        const spy = chai.spy.on(window, "showErrorMessage");
        await insertBookmarkInternal();
        expect(spy).to.have.been.called();
    });
    test("insertBookmarkInternal::insertContentToEditor", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ "label": "### Third Level Heading\r\n", "detail": " " }) as Thenable<any>;
        };

        const stub = sinon.stub(telemetry, "sendTelemetryData");

        const spy = chai.spy.on(common, "insertContentToEditor");
        insertBookmarkInternal();
        await sleep(300);
        expect(spy).to.have.been.called();
        stub.restore();
    });

});
