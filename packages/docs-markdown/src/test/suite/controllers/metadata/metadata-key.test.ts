import * as chai from 'chai';
import { isRequired, MetadataKey } from '../../../../controllers/metadata/metadata-key';

const expect = chai.expect;

suite('Metadata Keys', () => {
	test('isRequired()', () => {
		[
			'author',
			'description',
			'ms.author',
			'ms.date',
			'ms.service',
			'ms.prod',
			'ms.topic',
			'title'
		].forEach((key: MetadataKey) => {
			const result = isRequired(key);
			expect(result).to.be.true;
		});
	});
});
