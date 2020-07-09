import {
	convertDevlang,
	findCodeBlocks,
	regex
} from '../../../../controllers/cleanup/devlangsInCodeBlocks';
import * as chai from 'chai';
import { sleep, sleepTime } from '../../../test.common/common';

const expect = chai.expect;

suite('Convert devlangs', () => {
	test('findCodeBlocks', async () => {
		const spy = chai.spy(findCodeBlocks);
		findCodeBlocks('```json');
		await sleep(sleepTime);
		expect(spy).to.have.been.called;
	});
	test('lowerCaseDevlang', async () => {
		const data = '```JSON';
		const output = convertDevlang(data, regex);
		expect(output).to.equal('```json');
	});
});
