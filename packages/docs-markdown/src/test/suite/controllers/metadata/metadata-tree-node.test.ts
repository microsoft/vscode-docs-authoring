import * as chai from 'chai';
import { ThemeIcon } from 'vscode';

import { MetadataSource } from '../../../../controllers/metadata/metadata-source';
import {
	toDescription,
	toLabel,
	toSourceIcon,
	toSourceIconString,
	toSourceString
} from '../../../../controllers/metadata/metadata-tree-node';

const expect = chai.expect;

suite('Metadata Tree Node', () => {
	test('toDescription', () => {
		expect(toDescription(null)).to.be.null;

		let description = toDescription(MetadataSource.FileMetadata);
		expect(description).to.equal('(docfx fileMetadata)');

		description = toDescription(MetadataSource.GlobalMetadata);
		expect(description).to.equal('(docfx globalMetadata)');

		description = toDescription(MetadataSource.FrontMatter);
		expect(description).to.equal('(YAML front matter)');
	});

	test('toSourceIcon', () => {
		expect(toSourceIcon(null)).to.be.null;

		let icon = toSourceIcon(MetadataSource.FileMetadata);
		expect(icon).to.equal(new ThemeIcon('json'));

		icon = toSourceIcon(MetadataSource.GlobalMetadata);
		expect(icon).to.equal(new ThemeIcon('globe'));

		icon = toSourceIcon(MetadataSource.FrontMatter);
		expect(icon).to.equal(new ThemeIcon('markdown'));
	});

	test('toSourceIconString', () => {
		expect(toSourceIconString(null)).to.be.null;

		let iconString = toSourceIconString(MetadataSource.FileMetadata);
		expect(iconString).to.equal('$(json)');

		iconString = toSourceIconString(MetadataSource.GlobalMetadata);
		expect(iconString).to.equal('$(globe)');

		iconString = toSourceIconString(MetadataSource.FrontMatter);
		expect(iconString).to.equal('$(markdown)');
	});

	test('toSourceString', () => {
		expect(toSourceString(null)).to.be.null;

		let sourceString = toSourceString(MetadataSource.FileMetadata);
		expect(sourceString).to.equal("_docfx.json_ file's `fileMetadata` section.");

		sourceString = toSourceString(MetadataSource.GlobalMetadata);
		expect(sourceString).to.equal("_docfx.json_ file's `globalMetadata` section.");

		sourceString = toSourceString(MetadataSource.FrontMatter);
		expect(sourceString).to.equal('the YAML front matter of the file.');
	});

	test('toLabel', () => {
		let keyValuePair = toLabel('ms.author', null);
		expect(keyValuePair).to.equal('ms.author: ""');

		keyValuePair = toLabel('ms.author', 'dapine');
		expect(keyValuePair).to.equal('ms.author: dapine');
	});
});
