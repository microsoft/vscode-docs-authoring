import * as common from '../common';
import { buildSectionSummary, getItemDiv, buildTextLink } from './hubHelper';

// additionalContent section
// Supports up to 3 sections
export async function buildAdditionalContent(yamlObj: any) {
	let html = '';
	if (yamlObj.additionalContent) {
		if (yamlObj.additionalContent.sections) {
			html += `<section id="additional-content" class="has-background-alternating-grey has-padding-top-extra-large has-padding-bottom-extra-large">
              <div class="uhf-container anchor-headings">`;
			for (const section of yamlObj.additionalContent.sections.slice(0, 3)) {
				html += buildAdditionalContentTitle(common.getTitle(section));
				html += buildSectionSummary(common.getSummary(section));
				if (section.items) {
					html += `<div class="columns is-multiline">`;
					const itemsNum = section.items.length;
					for (const item of section.items) {
						html += await buildAdditionalContentSectionItem(item, itemsNum);
					}
					html += '</div>';
				}
			}
			html += buildAdditionalContentSectionFooter(yamlObj.additionalContent);
			html += '</div></section>';
		}
	}
	return html;
}

function buildAdditionalContentTitle(title: string) {
	const aria = common.convertHyphenAlpha(title);
	return `<h2 class="has-margin-top-none has-margin-bottom-large heading-anchor" id="${aria.toLowerCase()}">
      <a class="anchor-link docon docon-link" href="#${aria.toLowerCase()}" aria-labelledby="${aria.toLowerCase()}">
      </a>${title}</h2>`;
}

async function buildAdditionalContentSectionItem(item: any, numItem: number) {
	let html = '';
	html += getItemDiv(numItem);
	const url = common.getUrl(item);
	if (url) html += buildAdditionalContentSectionItemUrl(item);
	else html += `<div class="additional-card box is-block is-full-height has-padding-large">`;
	html += buildAdditionalContentSectionItemTitle(item);
	html += `<div class="has-text-subtle is-size-small has-line-height-reset"></div>`;
	html += buildAdditionalContentSectionItemSummary(item);
	if (item.links) {
		html += `<ul class="has-line-height-reset has-margin-left-none has-margin-bottom-none has-margin-top-extra-small">`;
		for (const link of item.links) {
			html += buildAdditionalContentSectionItemLink(link);
		}
		html += '</ul>';
	}
	if (url) {
		html += '</a>';
	} else {
		html += '</div>';
	}
	html += '</div>';
	return html;
}

function buildAdditionalContentSectionItemUrl(item: any) {
	return `<a href="${common.getUrl(item)}" 
					class="additional-card box is-full-height has-heavy-shadow-hover has-border-high-contrast-hover has-padding-large is-undecorated" 
        	aria-labelledby="-net-core-api-reference-0" data-linktype="relative-path">`;
}

function buildAdditionalContentSectionItemTitle(item: any) {
	return `<h3 class="is-size-h6 has-margin-top-none has-margin-bottom-small">
	${common.getTitle(item)}</h3>`;
}

function buildAdditionalContentSectionItemSummary(item: any) {
	return `<div class="has-text-subtle is-size-small has-line-height-reset">
            ${common.getSummary(item)}</div>`;
}

function buildAdditionalContentSectionItemLink(link: any) {
	let html = '';
	html += `<li class="is-unstyled has-margin-bottom-small is-size-small">
  						<a href="${common.getUrl(link)}" data-linktype="absolute-path">
    						${common.getText(link)}
  						</a>`;
	html += buildAdditionalContentSectionItemLinkNote(link);
	html += '</li>';
	return html;
}

function buildAdditionalContentSectionItemLinkNote(link: any) {
	return `<span class="has-text-subtle"> ${common.getNote(link)}</span>`;
}

function buildAdditionalContentSectionFooter(yamlObj: any) {
	const footer = common.getFooter(yamlObj);
	let footerHtml = footer;
	if (footer) {
		const links = footer.match(/\[(.*?)\]\(.*?\)/gm);
		for (const link of links) {
			footerHtml = footerHtml.replace(link, buildTextLink(link));
		}
	}
	return `<div class="columns">
              <div class="column is-12 is-size-small has-line-height-reset">
                <p>${footerHtml} </p>
              </div>
            </div>`;
}
