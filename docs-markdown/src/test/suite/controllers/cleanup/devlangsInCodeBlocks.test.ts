import { convertDevlang, regex } from '../../../../controllers/cleanup/devlangsInCodeBlocks';
import * as chai from 'chai';

const expect = chai.expect;

suite('Convert devlangs', () => {
	test('lowerCaseDevlang', async () => {
		const data = '```JSON';
		const output = convertDevlang(data, regex);
		expect(output).to.equal('```json');
	});
	test('convertDevlang', async () => {
		const data = '```markdown';
		const output = convertDevlang(data, regex);
		expect(output).to.equal('```md');
	});
});
