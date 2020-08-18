import * as chai from 'chai';
import { container_plugin } from '../../../markdown-extensions/container';
import { videoOptions } from '../../../markdown-extensions/video';
const expect = chai.expect;

suite('Video Extension', () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const md = require('markdown-it')().use(container_plugin, 'video', videoOptions);
	test('Video source', async () => {
		const result = md.render(
			`:::video source="https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player":::`
		);
		expect(result).to.equal(
			`<video width="640" height="320" controls><source src="https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player"></video>`
		);
	});
});
