import * as chai from 'chai';
import * as spies from 'chai-spies';
import {
	removeHtmlComments,
	removeHashtagComments
} from '../../../../controllers/cleanup/stripComments';
chai.use(spies);

const expect = chai.expect;

suite('Strip comments', () => {
	test('cleanup repo - strip html comments', async () => {
		const data = `<!-- html comment -->`;
		const output = removeHtmlComments(data);
		expect(output).to.be.equal(``);
	});
	test('cleanup repo - do not strip comments in code blocks', async () => {
		const data = '```bash\n<!-- html comment -->\n```';
		const output = removeHtmlComments(data);
		expect(output).to.be.equal('```bash\n<!-- html comment -->\n```');
	});
	test('cleanup repo - strip hashtag comments', async () => {
		const data = `# strip hashtag comments`;
		const output = removeHashtagComments(data);
		expect(output).to.be.equal(``);
	});
	test('cleanup repo - do not strip yamlmime type', async () => {
		const data = `### YamlMime:ModuleUnit`;
		const output = removeHashtagComments(data);
		expect(output).to.be.equal(`### YamlMime:ModuleUnit`);
	});
});
