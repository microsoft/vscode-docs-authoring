import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window } from "vscode";
import { insertBookmarkCommands, insertBookmarkExternal, insertBookmarkInternal } from "../../../controllers/bookmark-controller";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep } from "../../test.common/common";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");

const expect = chai.expect;

suite("Bookmark Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
        chai.spy.restore(window);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
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
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo");
        await loadDocumentAndGetItReady(`${filePath}/articles/bookmark.md`);
        const qpSelectionItems = [
            { label: "README.md", description: filePath },
            { label: "## Getting Started\r\n", detail: " " },
        ];
        let counter = 0;
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
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/bookmark.md");
        await loadDocumentAndGetItReady(filePath);
        const spy = chai.spy.on(window, "showErrorMessage");
        await insertBookmarkInternal();
        expect(spy).to.have.been.called();
    });
    test("insertBookmarkInternal::insertContentToEditor", async () => {
        const filePath = resolve(__dirname, "../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "### Third Level Heading\r\n", detail: " " }) as Thenable<any>;
        };

        const stub = sinon.stub(telemetry, "sendTelemetryData");

        const spy = chai.spy.on(common, "insertContentToEditor");
        insertBookmarkInternal();
        await sleep(300);
        expect(spy).to.have.been.called();
        stub.restore();
    });

});
