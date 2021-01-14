/* eslint-disable @typescript-eslint/no-var-requires */
import * as chai from 'chai';
import { image_end, imageOptions } from '../../../markdown-extensions/image';
import { inline_plugin } from '../../../helper/common';

const expect = chai.expect;

suite('Image Extension', () => {
	const md = require('markdown-it')().use(inline_plugin, 'image', imageOptions).use(image_end);
	test('Image type content', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" alt-text="lsi":::`
		);
		expect(result).to.equal(
			`<p><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></p>\n`
		);
	});
	test('Image type icon', async () => {
		const result = md.render(`:::image type="icon" source="../links/media/LSIs.png":::`);
		expect(result).to.equal(`<p><img src="../links/media/LSIs.png"></p>\n`);
	});
	test('Image type complex', async () => {
		const result = md.render(`:::image type="complex" source="../links/media/LSIs.png" alt-text="lsi complex":::
        :::image-end:::`);
		expect(result).to.equal(
			`<p><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></p>\n`
		);
	});
	test('Image type content - no border', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" border="false" alt-text="lsi":::`
		);
		expect(result).to.equal(`<p><img src="../links/media/LSIs.png"></p>\n`);
	});
	test('Image type content - lightbox', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" lightbox="../links/media/LSIs.png" alt-text="lsi":::`
		);
		expect(result).to.equal(
			`<p><a href="../links/media/LSIs.png#lightbox" data-linktype="relative-path"><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></a></p>\n`
		);
	});
	test('Image type content - link', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" alt-text="lsi" link="https://microsoft.com":::`
		);
		expect(result).to.equal(
			`<p><a href="https://microsoft.com" data-linktype="relative-path"><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></a></p>\n`
		);
	});
});
