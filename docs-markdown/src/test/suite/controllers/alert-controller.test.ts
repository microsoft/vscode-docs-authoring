// You can import and use all API from the 'vscode' module
import * as vscode from "vscode"
import * as controller from "../../../controllers/alert-controller";
import * as common from "../../../helper/common";
import { selectLinkType } from "../../../controllers/media-controller";
// import * as assert from 'assert';
// import * as common from "../../../helper/common";
//import { window } from "vscode";

const chai = require('chai')
    , spies = require('chai-spies');

chai.use(spies);

const expect = chai.expect;

suite('Alert Controller', () => {
    test('insertAlertCommand', () => {
        const commands = [
            { command: controller.insertAlert.name, callback: controller.insertAlert },
        ];

        var comm = controller.insertAlertCommand();
        expect(comm[0].command).to.equal(commands[0].command);
    });
    test('noActiveEditorMessage', () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        controller.insertAlert();
        expect(spy).to.have.been.called();
    });
    test('isMarkdownFileCheck', async () => {
        __dirname
        const uri = vscode.Uri.file('/_/repos/docs-markdown-testing');
        let success = await vscode.commands.executeCommand('vscode.openFolder', uri);
        if (success) {
            const docUri = vscode.Uri.file('/_/repos/docs-markdown-testing/testing-docs/authoring/extensions/docs-markdown.md');
            const document = await vscode.workspace.openTextDocument(docUri)
        }

    });

});
