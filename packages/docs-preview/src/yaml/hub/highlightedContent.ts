import * as common from '../common';
import { buildSectionSummary, getItemDiv } from './hubHelper';

// highlightedContent section
// Maximum of 8 itemshighlightedContent:
// itemType: architecture | concept | deploy | download | get-started | how-to-guide | learn | overview | quickstart | reference | tutorial | video | whats-new
// title < 60 chars (optional)
// summary: sectionsummary # < 160 chars (optional)
export async function buildHighlightedContent(yamlObj: any) {
	let html = '';
	if (yamlObj.highlightedContent) {
		html += `<section id="highlighted-content" class="has-background-alternating-grey">
    <div class="uhf-container has-padding-top-large has-padding-bottom-large">
      <div class="columns is-multiline">`;
		if (yamlObj.highlightedContent.items) {
			for (let item of yamlObj.highlightedContent.items) {
				html += buildHighlightedContentItem(
					item,
					yamlObj.highlightedContent.items.indexOf(item),
					common.getBrand(yamlObj),
					yamlObj.highlightedContent.items.length
				);
			}
		}

		html += `</div></div></section>`;
	}

	return html;
}
function buildHighlightedContentItem(item: any, index: number, brand: string, numItem?: number) {
	let html = '';
	html += getItemDiv(numItem);
	html += `<a href="${common.getUrl(item)}"
  class="box is-block is-full-height has-padding-medium has-heavy-shadow-hover has-border-high-contrast-hover has-padding-large is-undecorated"
  aria-labelledby="${common.convertHyphenAlphaCounter(common.getTitle(item), index)}"
  data-linktype="external">
  <div class="columns">
    <div class="is-hidden-mobile">
      <div class="image is-max-64x64 has-text-${brand}">
        ${common.getSvgSource(common.getItemType(item))}
      </div>
    </div>
    <div class="column is-9 has-padding-top-extra-small">
      <p class="is-size-extra-small has-margin-none has-text-subtle is-uppercase">
        ${common.getItemType(item)}
      </p>
      <h2 id="download--net-0" class="is-size-h6 has-margin-none">${common.getTitle(item)}</h2>
    </div>
  </div>
</a>`;
	html += `</div>`;

	return html;
}
