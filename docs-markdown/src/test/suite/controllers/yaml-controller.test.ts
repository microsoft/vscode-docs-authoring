import * as chai from "chai";
import * as spies from "chai-spies";
import { resolve, sep, basename, dirname } from "path";
import { commands, Uri, window, workspace, InputBoxOptions } from "vscode";
import * as common from "../../../helper/common";
import * as telemetry from "../../../helper/telemetry";
import {
  loadDocumentAndGetItReady,
  sleep,
  sleepTime,
} from "../../test.common/common";
import {
  insertTocEntry,
  insertTocEntryWithOptions,
  insertExpandableParentNode,
  yamlCommands,
  showQuickPick,
} from "../../../controllers/yaml/yaml-controller";
import * as checkForPreviousEntry from "../../../controllers/yaml/checkForPreviousEntry";
import * as createParentNode from "../../../controllers/yaml/createParentNode";
import * as createEntry from "../../../controllers/yaml/createEntry";

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require("sinon");

const expect = chai.expect;

suite("Yaml Controller", () => {
  suiteSetup(async () => {
    sinon.stub(telemetry, "sendTelemetryData");
    const testFile =
      "../../../../../src/test/data/repo/articles/docs-markdown.md";
    const testFilePath = resolve(__dirname, testFile);
    window.showQuickPick = (items: string[] | Thenable<string[]>) => {
      return Promise.resolve({
        label: `${basename(testFilePath)}`,
        description: `${dirname(testFilePath)}`,
      }) as Thenable<any>;
    };
    window.showInputBox = (options: InputBoxOptions) => {
      return Promise.resolve("Docs Markdown Reference") as Thenable<any>;
    };
  });
  // Reset and tear down the spies
  teardown(() => {
    chai.spy.restore(common);
  });
  suiteTeardown(async () => {
    await commands.executeCommand("workbench.action.closeAllEditors");
    sinon.restore();
  });
  test("yaml-controller - yamlCommands", () => {
    const controllerCommands = [
      { command: insertTocEntry.name, callback: insertTocEntry },
      {
        command: insertTocEntryWithOptions.name,
        callback: insertTocEntryWithOptions,
      },
      {
        command: insertExpandableParentNode.name,
        callback: insertExpandableParentNode,
      },
    ];
    expect(yamlCommands()).to.deep.equal(controllerCommands);
  });
  test("yaml-controller - insertTocEntry", async () => {
    const filePath = resolve(
      __dirname,
      "../../../../../src/test/data/repo/articles/yaml-controller.yml"
    );
    await loadDocumentAndGetItReady(filePath);
    const spy = chai.spy.on(checkForPreviousEntry, "checkForPreviousEntry");
    await insertTocEntry();
    await sleep(sleepTime);
    expect(spy).to.have.been.called();
  });
  test("yaml-controller - insertTocEntryWithOptions", async () => {
    const spy = chai.spy.on(checkForPreviousEntry, "checkForPreviousEntry");
    await insertTocEntryWithOptions();
    await sleep(sleepTime);
    expect(spy).to.have.been.called();
  });
  test("yaml-controller - insertTocEntryWithOptions", async () => {
    const spy = chai.spy.on(createParentNode, "createParentNode");
    await insertExpandableParentNode();
    await sleep(sleepTime);
    expect(spy).to.have.been.called();
  });
  test("yaml-controller - showQuickPick", async () => {
    const spy = chai.spy.on(createEntry, "createEntry");
    await showQuickPick(true);
    await sleep(sleepTime);
    expect(spy).to.have.been.called();
  });
});
