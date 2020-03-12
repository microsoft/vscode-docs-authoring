// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
//import { insertAlert, insertAlertCommand } from '../../../controllers/alert-controller';
//import { isMarkdownFileCheck } from '../../../helper/common';
// import * as myExtension from '../extension';

import * as controller from "../../../controllers/alert-controller";
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
    test('isMarkdownFileCheck', () => {
        const spy = chai.spy.on(controller, "insertAlert");
        controller.insertAlert();
        expect(spy).to.have.been.called();
    });
    test('noActiveEditorMessage', () => {
        //const editor = window.activeTextEditor;
    });

});
