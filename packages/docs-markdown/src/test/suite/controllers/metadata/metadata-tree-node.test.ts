import * as chai from 'chai';
import { ThemeIcon } from 'vscode';
import { MetadataCategory } from '../../../../controllers/metadata/metadata-category';
import { MetadataSource } from '../../../../controllers/metadata/metadata-source';
import {
	toDescription,
	toSourceIcon,
	toSourceIconString,
	toSourceString
} from '../../../../controllers/metadata/metadata-tree-node';

const expect = chai.expect;

suite('Metadata Tree Node', () => {
	test('toDescription', () => {
		expect(toDescription(null)).to.be.null;

		let description = toDescription({
			category: MetadataCategory.Required,
			value: '',
			source: MetadataSource.FrontMatter
		});
		expect(description).to.equal('""');

		description = toDescription({
			category: MetadataCategory.Required,
			value: 'conceptual',
			source: MetadataSource.FrontMatter
		});
		expect(description).to.equal('conceptual');

		description = toDescription({
			category: MetadataCategory.Required,
			value: false,
			source: MetadataSource.FrontMatter
		});
		expect(description).to.equal('false');

		description = toDescription({
			category: MetadataCategory.Required,
			value: false,
			source: MetadataSource.Missing
		});
		expect(description).to.equal('?');

		// Value arrays.
		description = toDescription({
			category: MetadataCategory.Required,
			value: ['CSharp'],
			source: MetadataSource.FrontMatter
		});
		expect(description).to.equal('CSharp');

		description = toDescription({
			category: MetadataCategory.Required,
			value: ['CSharp', 'VB'],
			source: MetadataSource.FrontMatter
		});
		expect(description).to.equal('(hover to see values)');
	});

	test('toSourceIcon', () => {
		expect(toSourceIcon(null)).to.be.null;

		let icon = toSourceIcon(MetadataSource.FileMetadata);
		expect(icon.id).to.equal(new ThemeIcon('json').id);

		icon = toSourceIcon(MetadataSource.GlobalMetadata);
		expect(icon.id).to.equal(new ThemeIcon('globe').id);

		icon = toSourceIcon(MetadataSource.FrontMatter);
		expect(icon.id).to.equal(new ThemeIcon('markdown').id);
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
		expect(sourceString).to.equal("_docfx.json_ file's `build/fileMetadata` section.");

		sourceString = toSourceString(MetadataSource.GlobalMetadata);
		expect(sourceString).to.equal("_docfx.json_ file's `build/globalMetadata` section.");

		sourceString = toSourceString(MetadataSource.FrontMatter);
		expect(sourceString).to.equal('the YAML front matter of this Markdown file.');
	});
});
