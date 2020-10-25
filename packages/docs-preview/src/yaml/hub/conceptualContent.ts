import * as common from '../common';
import { buildSectionSummary, getItemDiv, buildSectionHeader } from './hubHelper';

// conceptualContent section
// title < 60 chars (optional)
// summary: sectionsummary # < 160 chars (optional)
export async function buildConceptualContent(yamlObj: any) {
	let html = '';
	if (yamlObj.conceptualContent) {
		html += `<section id="conceptual-content" class="has-background-alternating-grey has-padding-top-extra-large has-padding-bottom-extra-large">
		<div class="uhf-container anchor-headings">`;
		html += buildSectionHeader(common.getTitle(yamlObj.conceptualContent));
		html += buildSectionSummary(common.getSummary(yamlObj.conceptualContent));
		if (yamlObj.conceptualContent.items) {
			html += '<div class="columns is-multiline">';
			for (let item of yamlObj.conceptualContent.items) {
				html += await buildConceptualContentItem(item, yamlObj.conceptualContent.items.length);
			}
			html += '</div>';
		}
		html += '</div></section>';
	}
	return html;
}

async function buildConceptualContentItem(item: any, numItem: number) {
	let html = '';
	html += `${getItemDiv(numItem)}
          <div class="box is-full-height has-padding-large">`;
	html += buildConceptualContentItemTitle(common.getTitle(item));
	html += buildConceptualContentItemSummmary(common.getSummary(item));
	if (item.links) {
		html += await buildConceptualContentItemList(item.links);
	}
	html += `</div></div>`;
	return html;
}

function buildConceptualContentItemTitle(title: string) {
	return `<h3 class="is-size-h6 has-margin-top-none has-margin-bottom-small">${title}</h3>`;
}
function buildConceptualContentItemSummmary(summary: string) {
	return `<p class="is-size-small has-line-height-reset has-margin-top-none has-margin-bottom-medium">${summary}</p>`;
}
async function buildConceptualContentItemList(links: any) {
	let html = '';
	let url = '';
	let text = '';
	let itemType = '';
	html += `<ul class="has-line-height-reset has-margin-left-none has-margin-bottom-none has-margin-top-extra-small">`;
	for (let item of links) {
		url = common.getUrl(item);
		itemType = common.getItemType(item);
		text = common.getText(item);
		html += `<li class="is-unstyled has-margin-bottom-small">
              <a href="${url}" class="has-flex-justify-content-start is-flex is-fullwidth has-text-wrap is-size-small" data-linktype="absolute-path">
                <span class="docon docon-topic-${itemType.toLowerCase()} is-size-body has-margin-right-small" aria-hidden="true"></span>
                <span>${text}</span>
              </a>
            </li>`;
	}

	html += `</ul>`;
	return html;
}
