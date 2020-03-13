// You can import and use all API from the 'vscode' module
import * as vscode from "vscode"
import * as controller from "../../../controllers/alert-controller";
import * as common from "../../../helper/common";
import * as assert from 'assert';
import { insertAlertCommand, insertAlert } from "../../../controllers/alert-controller";
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
            { command: insertAlert.name, callback: insertAlert },
        ];

        var comm = insertAlertCommand();
        assert.equal(comm[0].command, commands[0].command);
    });
    test('noActiveEditorMessage', () => {
        const spy = chai.spy.on(common, "noActiveEditorMessage");
        controller.insertAlert();
        expect(spy).to.have.been.called();
    });
    test('isMarkdownFileCheck', async () => {
        const docUri = vscode.Uri.file('/_/repos/docs-markdown-testing/testing-docs/authoring/extensions/docs-markdown.md');
        const document = await vscode.workspace.openTextDocument(docUri);
        const editor = await vscode.window.showTextDocument(document);

        const spy = chai.spy.on(common, "isMarkdownFileCheck");
        controller.insertAlert();
        expect(spy).to.have.been.called();
    });
    test('insertContentToEditor - Note', async () => {
        const docUri = vscode.Uri.file('/_/repos/docs-markdown-testing/testing-docs/authoring/extensions/docs-markdown.md');
        const document = await vscode.workspace.openTextDocument(docUri);
        const editor = await vscode.window.showTextDocument(document);

        vscode.window.showQuickPick = (items: string[] | Thenable<string[]>) => {
            return Promise.resolve('Note – Information the user should notice even if skimming') as Thenable<any>;
        };
        const spy = chai.spy.on(common, "insertContentToEditor");
        controller.insertAlert();
        await sleep(400)
        expect(spy).to.have.been.called();
    });

});


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}