import {
	convertDevlang,
	findCodeBlocks,
	lowercaseDevlang,
	regex
} from '../../../../controllers/cleanup/devlangsInCodeBlocks';
import * as chai from 'chai';
import { sleep, sleepTime } from '../../../test.common/common';

const expect = chai.expect;

suite('Convert devlangs', () => {
	test('find triple tick code blocks', async () => {
		const spy = chai.spy(findCodeBlocks);
		findCodeBlocks('```json');
		await sleep(sleepTime);
		expect(spy).to.have.been.called;
	});
	test('devlang should be lowercase', async () => {
		const data = '```JSON';
		const output = lowercaseDevlang(data, regex);
		expect(output).to.equal('```json');
	});
	test('cs devlang should be csharp', async () => {
		const inputString = '```cs ```';
		const outputString = '```csharp```';
		const output = convertDevlang(inputString);
		expect(output).to.equal(outputString);
	});
	test('markdown devlang should be md', async () => {
		const inputString = '```markdown ```';
		const outputString = '```md```';
		const output = convertDevlang(inputString);
		expect(output).to.equal(outputString);
	});
});
