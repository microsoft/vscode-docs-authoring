/* eslint-disable @typescript-eslint/no-var-requires */
import * as chai from 'chai';
import { container_plugin } from '../../../markdown-extensions/container';
import { image_end, imageOptions } from '../../../markdown-extensions/image';
const expect = chai.expect;

suite('Image Extension', () => {
	const md = require('markdown-it')().use(container_plugin, 'image', imageOptions).use(image_end);
	test('Image type content', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" alt-text="lsi":::`
		);
		expect(result).to.equal(
			`<div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div>`
		);
	});
	test('Image type icon', async () => {
		const result = md.render(`:::image type="icon" source="../links/media/LSIs.png":::`);
		expect(result).to.equal(`<img src="../links/media/LSIs.png">`);
	});
	test('Image type complex', async () => {
		const result = md.render(`:::image type="complex" source="../links/media/LSIs.png" alt-text="lsi complex":::
        :::image-end:::`);
		expect(result).to.equal(
			`<div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div>`
		);
	});
	test('Image type content - no border', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" border="false" alt-text="lsi":::`
		);
		expect(result).to.equal(`<img src="../links/media/LSIs.png">`);
	});
	test('Image type content - lightbox', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" lightbox="../links/media/LSIs.png" alt-text="lsi":::`
		);
		expect(result).to.equal(
			`<a href="../links/media/LSIs.png#lightbox" data-linktype="relative-path"><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></a>`
		);
	});
	test('Image type content - link', async () => {
		const result = md.render(
			`:::image type="content" source="../links/media/LSIs.png" alt-text="lsi" link="https://microsoft.com":::`
		);
		expect(result).to.equal(
			`<a href="https://microsoft.com" data-linktype="relative-path"><div class="mx-imgBorder"><p><img src="../links/media/LSIs.png"></p></div></a>`
		);
	});
});
