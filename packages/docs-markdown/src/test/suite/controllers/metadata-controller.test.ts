import * as assert from 'assert';
import * as chai from 'chai';
import * as os from 'os';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import * as metadataController from '../../../controllers/metadata/metadata-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { expectStringsToEqual, loadDocumentAndGetItReady, sleep } from '../../test.common/common';
import sinon = require('sinon');
import { MetadataEntry } from '../../../controllers/metadata/metadata-entry';
import { MetadataCategory } from '../../../controllers/metadata/metadata-category';
import { MetadataSource } from '../../../controllers/metadata/metadata-source';

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
			},
			{
				command: metadataController.updateImplicitMetadataValues.name,
				callback: metadataController.updateImplicitMetadataValues
			}
		];
		expect(metadataController.insertMetadataCommands()).to.deep.equal(controllerCommands);
	});
	test('updateImplicitMetadataValues().noActiveEditorMessage()', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		metadataController.updateImplicitMetadataValues();
		expect(spy).to.have.been.called();
	});
	test('updateImplicitMetadataValues().isMarkdownFileCheck()', async () => {
		// pass in a non-markdown file
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await metadataController.updateImplicitMetadataValues();
		expect(spy).to.have.been.called();
	});
	test('getAllEffectiveMetadata()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/effective-metadata.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const metadataEntries = metadataController.getAllEffectiveMetadata();
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
			}
		];

		expectedEntries.forEach(expected => {
			const actual = metadataEntries.find(e => e.key === expected.key);
			expect(actual).deep.equal(expected);
		});
	});
	test('updateImplicitMetadataValues()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const expectedText =
			'---' +
			os.EOL +
			'author: bar' +
			os.EOL +
			'manager: bar' +
			os.EOL +
			'titleSuffix: bar' +
			os.EOL +
			'ms.author: bar' +
			os.EOL +
			'ms.date: ' +
			common.toShortDate(new Date()) +
			os.EOL +
			'ms.service: bar' +
			os.EOL +
			'ms.subservice: bar' +
			os.EOL +
			'---' +
			os.EOL;

		await metadataController.updateImplicitMetadataValues();
		const actualText = window.activeTextEditor?.document.getText();

		// cleanup the modified metadata.md to prevent false positives for future tests.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + filePath);
		expectStringsToEqual(expectedText, actualText);
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
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + filePath);
		expectStringsToEqual(expectedText, actualText);
	});
});
