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
	test('cleanup repo - if alt text ends in a quote, put the period inside the quotes', async () => {
		const data = `![screenshot of the "Training a classifier notebook"](../media/resources.png)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(
			`![screenshot of the "Training a classifier notebook."](../media/resources.png)`
		);
	});
	test('cleanup repo - ignore whitespace at the end of alt text with quotes to avoid duplicate periods', async () => {
		const data = `![screenshot of the "Training a classifier notebook". ](../media/resources.png)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(
			`![screenshot of the "Training a classifier notebook."](../media/resources.png)`
		);
	});
	test('cleanup repo - ignore whitespace at the end of alt text to avoid duplicate periods', async () => {
		const data = `![screenshot showing Jupyter Notebooks dashboard.  ](../media/resources.png)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(
			`![screenshot showing Jupyter Notebooks dashboard.](../media/resources.png)`
		);
	});
	test('cleanup repo - add period to lightbox alt text', async () => {
		const data = `[![How to enable Azure Synapse Link in the Azure portal](../media/enable-azure-synpase-link-sql-api.png)](../media/enable-azure-synpase-link-sql-api.png#lightbox)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(
			`[![How to enable Azure Synapse Link in the Azure portal.](../media/enable-azure-synpase-link-sql-api.png)](../media/enable-azure-synpase-link-sql-api.png#lightbox)`
		);
	});
	test('cleanup repo - do not add period to lightbox alt text if one exists', async () => {
		const data = `[![How to enable Azure Synapse Link in the Azure portal.](../media/enable-azure-synpase-link-sql-api.png)](../media/enable-azure-synpase-link-sql-api.png#lightbox)`;
		const output = addPeriodsForMd(data);
		expect(output).to.be.equal(
			`[![How to enable Azure Synapse Link in the Azure portal.](../media/enable-azure-synpase-link-sql-api.png)](../media/enable-azure-synpase-link-sql-api.png#lightbox)`
		);
	});
	test('cleanup repo - do not add period to additional properties', async () => {
		const data = `:::image type="content" source="../media/satellite.png" alt-text="Image of a satellite map of Seattle." border="false":::`;
		const output = addPeriodsForTripleColonImage(data);
		expect(output).to.be.equal(
			`:::image type="content" source="../media/satellite.png" alt-text="Image of a satellite map of Seattle." border="false":::`
		);
	});
});
