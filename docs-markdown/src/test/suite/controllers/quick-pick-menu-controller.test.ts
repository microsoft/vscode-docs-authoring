/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as telemetry from '../../../helper/telemetry';
import { resolve } from 'path';
import { commands, QuickPickItem, window, workspace } from 'vscode';
import * as boldController from './../../../controllers/bold-controller';
import * as italicController from '../../../controllers/italic-controller';
import * as codeController from '../../../controllers/code-controller';
import * as alertController from '../../../controllers/alert-controller';
import * as listController from '../../../controllers/list-controller';
import * as tableController from '../../../controllers/table-controller';
import * as rowColumnsController from '../../../controllers/row-columns-controller';
import * as linkController from '../../../controllers/link-controller';
import * as noLocController from '../../../controllers/no-loc-controller';
import * as imageController from '../../../controllers/image-controller';
import * as includeController from '../../../controllers/include-controller';
import * as snippetController from '../../../controllers/snippet/snippet-controller';
import * as mediaController from '../../../controllers/media-controller';
import * as cleanupController from '../../../controllers/cleanup/cleanup-controller';
import * as monikerController from '../../../controllers/moniker-controller';
import * as yamlController from '../../../controllers/yaml/yaml-controller';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');
import {
	markdownQuickPick,
	quickPickMenuCommand
} from '../../../controllers/quick-pick-menu-controller';

const expect = chai.expect;

suite('Quick Pick Menu Controller', () => {
	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('quickPickMenuCommand', () => {
		const controllerCommands = [{ command: markdownQuickPick.name, callback: markdownQuickPick }];
		expect(quickPickMenuCommand()).to.deep.equal(controllerCommands);
	});
	test('markdownQuickPick - formatBold', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(pencil) Bold'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(boldController, 'formatBold');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - formatItalic', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(info) Italic'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(italicController, 'formatItalic');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - formatCode', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(code) Code'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(codeController, 'formatCode');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertAlert', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(alert) Alert'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		stubShowQuickPick.onCall(1).resolves('some selection');
		const spy = chai.spy.on(alertController, 'insertAlert');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertNumberedList', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(list-ordered) Numbered list'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(listController, 'insertNumberedList');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertBulletedList', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(list-unordered) Bulleted list'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(listController, 'insertBulletedList');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertTable', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(diff-added) Table'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(tableController, 'insertTable');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - pickLinkType', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			description: '',
			label: '$(link) Link'
		};
		const item2: QuickPickItem = {
			description: '',
			label: '(foo)'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);
		const spy = chai.spy.on(linkController, 'pickLinkType');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - noLocText', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(lock) Non-localizable text'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(noLocController, 'noLocText');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - pickImageType', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			description: '',
			label: '$(file-media) Image'
		};
		const item2: QuickPickItem = {
			description: resolve(__dirname, '../../../../../src/test/data/repo/images/'),
			label: 'test.png'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);
		const spy = chai.spy.on(imageController, 'pickImageType');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertInclude', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(clippy) Include'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(includeController, 'insertInclude');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertSnippet', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			label: '$(file-code) Snippet',
			description: ''
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(snippetController, 'insertSnippet');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		chai.spy.restore();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertVideo', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(device-camera-video) Video'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(mediaController, 'insertVideo');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertRowsAndColumns', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(ellipsis) Columns'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		stubShowQuickPick.onCall(1).resolves('some selection');
		const spy = chai.spy.on(rowColumnsController, 'insertRowsAndColumns');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - applyCleanup', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(tasklist) Cleanup...'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(cleanupController, 'applyCleanup');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertMoniker', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(project) Moniker'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(monikerController, 'insertMoniker');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertTocEntry', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(note) TOC entry'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		stubShowQuickPick.onCall(1).resolves('some selection');
		const spy = chai.spy.on(yamlController, 'insertTocEntry');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertTocEntryWithOptions', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(note) TOC entry with optional attributes'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(yamlController, 'insertTocEntryWithOptions');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('markdownQuickPick - insertExpandableParentNode', async () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: '$(note) Parent node'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(yamlController, 'insertExpandableParentNode');
		markdownQuickPick();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
});
