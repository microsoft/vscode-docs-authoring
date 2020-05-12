
import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve } from "path";
import { commands, Uri, window } from "vscode";
import * as capitalizationOfMetadata from "../../../../controllers/cleanup/capitalizationOfMetadata";
import { applyCleanup, applyCleanupCommand, applyCleanupFile, applyCleanupFolder } from "../../../../controllers/cleanup/cleanup-controller";
import * as singleValuedMetadata from "../../../../controllers/cleanup/handleSingleValuedMetadata";
import * as microsoftLinks from "../../../../controllers/cleanup/microsoftLinks";
import * as removeEmptyMetadata from "../../../../controllers/cleanup/removeEmptyMetadata";
import * as utilities from "../../../../controllers/cleanup/utilities";
import * as masterRedirection from "../../../../controllers/redirects/generateRedirectionFile";
import * as common from "../../../../helper/common";
import * as telemetry from "../../../../helper/telemetry";
import { extendedSleepTime, loadDocumentAndGetItReady, sleep, sleepTime } from "../../../test.common/common";
chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");

const expect = chai.expect;
const filePath = resolve(__dirname, "../../../../../../src/test/data/repo/articles/docs-markdown.md");
const folderPath = resolve(__dirname, "../../../../../../src/test/data/repo/articles");

suite("Cleanup Controller", () => {
    // Reset and tear down the spies
    teardown(() => {
        chai.spy.restore(common);
    });
    suiteTeardown(async () => {
        await commands.executeCommand("workbench.action.closeAllEditors");
    });
    test("cleanup repo - insertAlertCommand", () => {
        const controllerCommands = [
            { command: applyCleanup.name, callback: applyCleanup },
        ];
        expect(applyCleanupCommand()).to.deep.equal(controllerCommands);
    });
    test("cleanup repo - getCleanUpQuickPick", async () => {
        const spy = chai.spy.on(utilities, "getCleanUpQuickPick");
        await applyCleanup();
        await sleep(sleepTime);
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - noActiveEditorMessage", async () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        await applyCleanup();
        await sleep(sleepTime);
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - master redirection file", async () => {
        await loadDocumentAndGetItReady(filePath);

        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "master redirection file", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(masterRedirection, "generateMasterRedirectionFile");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        await sleep(sleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - recurseCallback", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "single-valued metadata", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(utilities, "recurseCallback");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - empty metadata - empty values", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove metadata attributes with empty values", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - empty metadata - n/a", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - empty metadata - commented", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove commented out metadata attributes", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup repo - empty metadata - all", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove all", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanup();
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - getCleanUpQuickPick", async () => {
        const spy = chai.spy.on(utilities, "getCleanUpQuickPick");
        await applyCleanupFile(Uri.file(filePath));
        expect(spy).to.have.been.called();
    });
    test("cleanup file - single-valued metadata", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "single-valued metadata", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(singleValuedMetadata, "handleSingleValuedMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - microsoft links", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "microsoft links", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(microsoftLinks, "microsoftLinks");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - capitalization of metadata values", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "capitalization of metadata values", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(capitalizationOfMetadata, "capitalizationOfMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - empty metadata - empty values", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove metadata attributes with empty values", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - empty metadata - n/a", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - empty metadata - commented", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove commented out metadata attributes", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup file - empty metadata - all", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove all", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFile(Uri.file(filePath));
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - getCleanUpQuickPick", async () => {
        const spy = chai.spy.on(utilities, "getCleanUpQuickPick");
        await applyCleanupFolder(Uri.file(folderPath));
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - single-valued metadata", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "single-valued metadata", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(singleValuedMetadata, "handleSingleValuedMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - microsoft links", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "microsoft links", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(microsoftLinks, "microsoftLinks");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - capitalization of metadata values", async () => {
        window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve({ label: "capitalization of metadata values", detail: "" }) as Thenable<any>;
        };
        const spy = chai.spy.on(capitalizationOfMetadata, "capitalizationOfMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - empty metadata - empty values", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove metadata attributes with empty values", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - empty metadata - n/a", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - empty metadata - commented", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove commented out metadata attributes", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
    test("cleanup folder - empty metadata - all", async () => {
        const mockShowQuickPick = sinon.stub(window, "showQuickPick");
        mockShowQuickPick.onFirstCall().resolves({ label: "empty metadata", detail: "" });
        mockShowQuickPick.onSecondCall().resolves({ label: "remove all", detail: "" });
        const spy = chai.spy.on(removeEmptyMetadata, "removeEmptyMetadata");
        const stub = sinon.stub(telemetry, "sendTelemetryData");
        await applyCleanupFolder(Uri.file(folderPath));
        await sleep(extendedSleepTime);
        mockShowQuickPick.restore();
        stub.restore();
        expect(spy).to.have.been.called();
    });
});
