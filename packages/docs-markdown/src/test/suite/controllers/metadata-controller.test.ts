import * as chai from 'chai';
import * as spies from 'chai-spies';
import { execSync } from 'child_process';
import * as os from 'os';
import { resolve } from 'path';
import { commands, window, workspace } from 'vscode';
import { DocFxFileInfo, readDocFxJson } from '../../../controllers/metadata/docfx-file-parser';
import { MetadataCategory } from '../../../controllers/metadata/metadata-category';
import * as metadataController from '../../../controllers/metadata/metadata-controller';
import { MetadataEntry } from '../../../controllers/metadata/metadata-entry';
import { MetadataSource } from '../../../controllers/metadata/metadata-source';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { expectStringsToEqual, loadDocumentAndGetItReady, sleep } from '../../test.common/common';
import sinon = require('sinon');

chai.use(spies);
const expect = chai.expect;

suite('Metadata Controller', () => {
	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('insertMetadataCommands', () => {
		const controllerCommands = [
			{
				command: metadataController.updateMetadataDate.name,
				callback: metadataController.updateMetadataDate
			}
		];
		expect(metadataController.insertMetadataCommands()).to.deep.equal(controllerCommands);
	});
	test('getAllEffectiveMetadata()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/effective-metadata.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const editor = window.activeTextEditor;
		let docFxFileInfo: DocFxFileInfo;
		const folder = workspace.getWorkspaceFolder(editor.document.uri);
		if (folder) {
			// Read the DocFX.json file, search for metadata defaults.
			docFxFileInfo = readDocFxJson(folder.uri.fsPath);
			if (!docFxFileInfo) {
				return;
			}
		}
		const metadataEntries = metadataController.getAllEffectiveMetadata(docFxFileInfo);
		const expectedEntries: MetadataEntry[] = [
			{
				source: MetadataSource.FrontMatter,
				key: 'title',
				value: 'An introduction to being awesome!',
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.FrontMatter,
				key: 'description',
				value: "Just be yourself, you're enough and that's all that matters.",
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.FrontMatter,
				key: 'ms.date',
				value: '06/07/2021',
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'author',
				value: 'bar',
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'brand',
				value: 'azure',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'breadcrumb_path',
				value: '/azure/bread/toc.json',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'contributors_to_exclude',
				value: [
					'PRmerger',
					'PRMerger9',
					'PRMerger17',
					'PRMerger5',
					'PRMerger4',
					'PRMerger3',
					'PRMerger-2',
					'openpublishingbuild',
					'tysonn',
					'hexiaokai',
					'v-anpasi',
					'kiwhit',
					'DuncanmaMSFT',
					'Saisang',
					'deneha',
					'atookey',
					'chbain',
					'garycentric',
					'GitHubber17',
					'itechedit',
					'Ja-Dunn',
					'Jak-MS',
					'jborsecnik',
					'jomolnar',
					'KatieCumming',
					'Kellylorenebaker',
					'ktoliver',
					'Lisaco88',
					'MattGLaBelle',
					'megvanhuygen',
					'PMEds28',
					'rjagiewich',
					'rmca14',
					'ShannonLeavitt',
					'ShawnJackson',
					'TedA-M',
					'tfosmark',
					'tiburd',
					'trishamc',
					'ttorble',
					'v-albemi',
					'v-dansch',
					'v-rihow',
					'v-shils',
					'v-thepet',
					'sdwheeler',
					'meganbradley'
				],
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'featureFlags',
				value: ['show_learn_banner'],
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'feedback_github_repo',
				value: 'MicrosoftDocs/azure-docs',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'feedback_product_url',
				value: 'https://feedback.azure.com/forums/34192--general-feedback',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'feedback_system',
				value: 'GitHub',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'learn_banner_products',
				value: ['azure'],
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'manager',
				value: 'bar',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'ms.author',
				value: 'bar',
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'ms.service',
				value: 'bar',
				category: MetadataCategory.Required
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'ms.subservice',
				value: 'bar',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'recommendations',
				value: true,
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.GlobalMetadata,
				key: 'searchScope',
				value: ['Azure'],
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.FileMetadata,
				key: 'titleSuffix',
				value: 'bar',
				category: MetadataCategory.Optional
			},
			{
				source: MetadataSource.Missing,
				key: 'ms.topic',
				category: MetadataCategory.Required
			}
		];

		expect(expectedEntries.length).to.equal(metadataEntries.length);
		expectedEntries.forEach(expected => {
			const actual = metadataEntries.find(e => e.key === expected.key);
			if (actual) {
				expect(actual.source).to.equal(expected.source);
				expect(actual.value).deep.equal(expected.value);
				expect(actual.category).to.equal(expected.category);
			}
		});
	});
	test('updateMetadataDate().noActiveEditorMessage()', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		metadataController.updateMetadataDate();
		expect(spy).to.have.been.called();
	});
	test('updateMetadataDate().isMarkdownYamlFileCheckWithoutNotification()', async () => {
		// pass in a non-markdown file
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownYamlFileCheckWithoutNotification');
		await metadataController.updateMetadataDate();
		expect(spy).to.have.been.called();
	});
	test('updateMetadataDate()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata1.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const expectedText =
			'---' + os.EOL + 'ms.date: ' + common.toShortDate(new Date()) + os.EOL + '---' + os.EOL;

		await metadataController.updateMetadataDate();
		await sleep(500);
		const actualText = window.activeTextEditor?.document.getText();

		// cleanup the modified metadata.md to prevent false positives for future tests.
		execSync(`cd ${__dirname} && git checkout ${filePath}`);
		expectStringsToEqual(actualText, expectedText);
	});
});
