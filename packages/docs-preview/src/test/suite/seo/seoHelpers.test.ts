import * as chai from 'chai';
import * as spies from 'chai-spies';
import {
	getFirstParagraph,
	checkIfContainsMicrosoftDocs,
	getMarkdownDescription,
	getTitle,
	getYamlDescription,
	getMainContentIfExists,
	checkPathEndingWithJson,
	checkStartAndEndPaths
} from '../../../seo/seoHelpers';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('SEO Helper', () => {
	test('getFirstParagraph', async () => {
		const markdown = `---
    author: bharney0
---
# Header

first paragraph`;
		const result = getFirstParagraph(markdown);
		expect(result).to.be.equal(`first paragraph`);
	});
	test('checkIfContainsMicrosoftDocs includes | Microsoft Docs', async () => {
		const title = `title | Microsoft Docs`;
		const result = checkIfContainsMicrosoftDocs(title);
		expect(result).to.be.equal(title);
	});
	test('checkIfContainsMicrosoftDocs does not include | Microsoft Docs', async () => {
		const title = `title`;
		const result = checkIfContainsMicrosoftDocs(title);
		expect(result).to.be.equal(`${title} | Microsoft Docs`);
	});
	test('getMarkdownDescription', async () => {
		const detail = {
			title: '',
			description: 'description',
			date: '11/10/2020'
		};
		const yamlContent = {
			description: 'description'
		};
		const markdown = `---
    author: bharney0
---
# Header

first paragraph`;
		const result = getMarkdownDescription(detail, yamlContent, markdown);
		expect(result).to.be.equal('description');
	});
	test('getTitle', async () => {
		const title = 'title';
		const yamlContent = {
			description: 'description',
			titleSuffix: 'titleSuffix',
			title: 'title'
		};
		const basePath = 'c:/path';
		const filePath = 'file/path';
		const result = await getTitle(yamlContent, title, basePath, filePath);
		expect(result).to.be.equal(`${yamlContent.title} - ${yamlContent.titleSuffix}`);
	});
	test('getYamlDescription', async () => {
		const yamlContent = {
			summary: 'summary',
			title: 'title'
		};
		const result = getYamlDescription(yamlContent);
		expect(result).to.be.equal(`${yamlContent.title}. ${yamlContent.summary}.`);
	});
	test('getMainContentIfExists content', async () => {
		const content = 'content';
		const alt = 'alt';
		const result = getMainContentIfExists(content, alt);
		expect(result).to.be.equal(content);
	});
	test('getMainContentIfExists alt', async () => {
		const content = '';
		const alt = 'alt';
		const result = getMainContentIfExists(content, alt);
		expect(result).to.be.equal(alt);
	});
	test('checkPathEndingWithJson', async () => {
		const breadCrumbPath = 'breadcrumb/toc.json';
		const result = checkPathEndingWithJson(breadCrumbPath);
		expect(result).to.be.equal('breadcrumb/toc.yml');
	});
	test('checkStartAndEndPaths', async () => {
		const breadCrumbPath = 'path/breadcrumb/toc.yml';
		const basePath = 'c:/path';
		const result = checkStartAndEndPaths(breadCrumbPath, basePath);
		expect(result).to.be.equal('breadcrumb/toc.yml');
	});
});
