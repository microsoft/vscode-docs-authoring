import * as chai from 'chai';
import * as spies from 'chai-spies';
import {
	addPeriodsForMd,
	addPeriodsForTripleColonImage
} from '../../../../controllers/cleanup/addPeriodsToAlt';
chai.use(spies);

const expect = chai.expect;

suite('Add Periods To Alt Text', () => {
	test('cleanup repo - insert periods to alt text md images', async () => {
		const data = `![Responsive design](../media/responsivedesign.gif)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(`![Responsive design.](../media/responsivedesign.gif)`);
	});
	test('cleanup repo - insert periods to alt text triple colon images', async () => {
		const data = `:::image type="content" source="../media/responsivedesign.gif" alt-text="alt-text":::`;
		const output = addPeriodsForTripleColonImage(data);
		expect(output).to.be.equal(
			`:::image type="content" source="../media/responsivedesign.gif" alt-text="alt-text.":::`
		);
	});
});
