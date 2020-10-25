import * as common from '../common';
import { buildSectionSummary, getItemDiv, buildSectionHeader, getImageUrl } from './hubHelper';
// tools section
export async function buildTools(yamlObj: any) {
	let html = '';
	if (yamlObj.tools) {
		html += `<section id="tools" class="has-background-alternating-grey has-padding-top-extra-large has-padding-bottom-extra-large">
    <div class="uhf-container anchor-headings has-padding-bottom-large">`;
		html += buildSectionHeader(common.getTitle(yamlObj.tools));
		html += buildSectionSummary(common.getSummary(yamlObj.tools));
		if (yamlObj.tools.items) {
			html += '<div class="columns is-multiline">';
			for (let item of yamlObj.tools.items) {
				html += await buildToolsItem(
					item,
					yamlObj.tools.items.indexOf(item),
					yamlObj,
					yamlObj.tools.items.length
				);
			}
			html += '</div>';
		}
		html += '</div></section>';
	}
	return html;
}
async function buildToolsItem(item: any, index: number, yamlObj?: any, numItem?: number) {
	let html = '';
	let aria = common.convertHyphenAlphaCounter(common.getTitle(item), index);
	html += getItemDiv(numItem);
	html += buildToolsItemUrl(item, aria);
	html += `<div class="columns is-mobile has-margin-none is-full-height">`;
	html += buildToolsItemImageSrc(item, yamlObj);
	html += buildToolsItemTitle(item, aria);
	html += '</div></a></div>';
	return html;
}
function buildToolsItemImageSrc(item: any, yamlObj?: any) {
	return `
            <div class="column is-narrow is-flex has-flex-align-items-center is-full-height"> 
              <div class="image is-32x32">
                <img src="${getImageUrl(
									common.getImageSrc(item),
									yamlObj
								)}" alt="" loading="lazy" width="32" height="32" data-linktype="absolute-path">
              </div>
            </div>
          `;
}
function buildToolsItemTitle(item: any, aria: string) {
	return `<div class="column has-flex-align-self-center">
    <h3 id="${aria}" class="is-size-h6 has-margin-none has-text-weight-semibold">${common.getTitle(
		item
	)}</h3>
  </div>`;
}
function buildToolsItemUrl(item: any, aria: string) {
	switch (common.getUrl(item)) {
		case 'csharp/index.yml':
			return `<a href="https://docs.microsoft.com/en-us/dotnet/csharp/" class="box has-body-background-dark is-full-height has-padding-none has-heavy-shadow-hover has-border-high-contrast-hover is-undecorated" 
                  aria-labelledby="${aria}" data-linktype="relative-path">`;
		case 'fsharp/index.yml':
			return `<a href="https://docs.microsoft.com/en-us/dotnet/fsharp/" class="box has-body-background-dark is-full-height has-padding-none has-heavy-shadow-hover has-border-high-contrast-hover is-undecorated" 
                  aria-labelledby="${aria}" data-linktype="relative-path">`;
		case 'visual-basic/index.yml':
			return `<a href="https://docs.microsoft.com/en-us/dotnet/visual-basic/" class="box has-body-background-dark is-full-height has-padding-none has-heavy-shadow-hover has-border-high-contrast-hover is-undecorated" 
                  aria-labelledby="${aria}" data-linktype="relative-path">`;
		default:
			return `<a href="" class="box has-body-background-dark is-full-height has-padding-none has-heavy-shadow-hover has-border-high-contrast-hover is-undecorated" 
      aria-labelledby="${aria}" data-linktype="relative-path">`;
	}
}
