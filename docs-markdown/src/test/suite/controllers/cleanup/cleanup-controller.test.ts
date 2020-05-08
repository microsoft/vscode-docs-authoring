import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, window } from "vscode";
import * as cleanup from "../../../../controllers/cleanup/cleanup-controller";
// tslint:disable-next-line: no-duplicate-imports
import { applyCleanup } from "../../../../controllers/cleanup/cleanup-controller";
import * as masterRedirection from "../../../../controllers/redirects/generateRedirectionFile";
import * as common from "../../../../helper/common";
import * as telemetry from "../../../../helper/telemetry";
import { loadDocumentAndGetItReady, sleep, sleepTime } from "../../../test.common/common";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");

const expect = chai.expect;

suite("Cleanup Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });

    test("insertAlertCommand", () => {
        const controllerCommands = [
            { command: cleanup.applyCleanup.name, callback: cleanup.applyCleanup },
        ];
        expect(cleanup.applyCleanupCommand()).to.deep.equal(controllerCommands);
    });
    test("getCleanUpQuickPick", async () => {
        const spy = chai.spy.on(cleanup, "getCleanUpQuickPick");
        await applyCleanup();
        await sleep(300);
        expect(spy).to.have.been.called();
    });
    test("noActiveEditorMessage", async () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        await applyCleanup();
        await sleep(sleepTime);
        expect(spy).to.have.been.called();
    });
    test("master redirection file", async () => {
        const filePath = resolve(__dirname, "../../../../../../src/test/data/repo/articles/docs-markdown.md");
        await loadDocumentAndGetItReady(filePath);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "master redirection file", detail: " " }) as Thenable<any>;
        };
        const spy = chai.spy.on(masterRedirection, "generateMasterRedirectionFile");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        applyCleanup();
        await sleep(sleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
});
