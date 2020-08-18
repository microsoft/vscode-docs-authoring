/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { RedirectUrl } from '../../../controllers/redirects/redirect-url';

chai.use(spies);

const expect = chai.expect;

suite('Master Redirect Controller', () => {
	const options = {
		docsetName: 'azure',
		docsetRootFolderName: 'articles'
	};

	test('RedirectUrl parse fully qualified URL', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.filePath).to.equal('articles/subject/file.md');
		expect(redirectUrl!.toRelativeUrl()).to.equal('/azure/subject/file');
	});

	test('RedirectUrl parse relative standard path', () => {
		const url = '/azure/subject/file';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.filePath).to.equal('articles/subject/file.md');
		expect(redirectUrl!.toRelativeUrl()).to.equal(url);
	});

	test('RedirectUrl parse handles hash tag', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file#bookmark';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.filePath).to.equal('articles/subject/file.md');
		expect(redirectUrl!.toRelativeUrl()).to.equal('/azure/subject/file');
		expect(redirectUrl!.url.hash).to.equal('#bookmark');
	});

	test('RedirectUrl parse handles query strings', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file?pivot=lang-csharp';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.filePath).to.equal('articles/subject/file.md');
		expect(redirectUrl!.toRelativeUrl()).to.equal('/azure/subject/file');
		expect(redirectUrl!.url.search).to.equal('?pivot=lang-csharp');
	});

	test('RedirectUrl adaptHashAndQueryString correctly maintains query', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file?pivot=lang-csharp';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.adaptHashAndQueryString('/azure/file')).to.equal(
			'/azure/file?pivot=lang-csharp'
		);
	});

	test('RedirectUrl adaptHashAndQueryString correctly maintains hash', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file#bookmark';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.adaptHashAndQueryString('/azure/file')).to.equal('/azure/file#bookmark');
	});

	test('RedirectUrl isExternalUrl returns false', () => {
		const url = 'https://docs.microsoft.com/azure/subject/file';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.isExternalUrl).to.be.equal(false);
	});

	test('RedirectUrl isExternalUrl returns true', () => {
		const url = 'https://github.com/azure-docs';
		const redirectUrl = RedirectUrl.parse(options, url);

		expect(redirectUrl!.isExternalUrl).to.be.equal(true);
	});
});
