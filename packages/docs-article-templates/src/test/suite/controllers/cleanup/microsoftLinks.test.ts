import * as chai from 'chai';
import { handleLinksWithRegex } from '../../../../controllers/cleanup/microsoftLinks';

const expect = chai.expect;

suite('Microsoft Links', () => {
	// Reset and tear down the spies
	test('handleLinksWithRegex', async () => {
		const data = `http://aka.ms
http://microsoft.com
http://go.microsoft.com
http://visualstudio.com
http://office.com
http://docs.microsoft.com
http://azure.microsoft.com
http://azure.com
http://msdn.microsoft.com
http://msdn.com
http://technet.microsoft.com
http://technet.com
http://download.microsoft.com
http://docs.microsoft.com/en-us/
http://azure.microsoft.com/en-us/
http://msdn.microsoft.com/en-us/
http://technet.microsoft.com/en-us/`;
		const output = handleLinksWithRegex(data);
		expect(output).to.equal(`https://aka.ms
https://microsoft.com
https://go.microsoft.com
https://visualstudio.com
https://office.com
https://docs.microsoft.com
https://azure.microsoft.com
https://azure.com
https://msdn.microsoft.com
https://msdn.com
https://technet.microsoft.com
https://technet.com
https://download.microsoft.com
https://docs.microsoft.com/
https://azure.microsoft.com/
https://msdn.microsoft.com/
https://technet.microsoft.com/`);
	});
});
