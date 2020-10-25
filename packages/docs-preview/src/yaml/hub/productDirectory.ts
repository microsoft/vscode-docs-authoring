import * as common from '../common';
import { getItemDiv, getImageUrl } from './hubHelper';
// productDirectory section
export async function buildProductDirectory(yamlObj: any) {
	let html = '';
	let cardsAll = '';
	if (yamlObj.productDirectory) {
		html += `<section id="product-directory" class="has-background-alternating-grey">
							<div class="uhf-container anchor-headings has-padding-top-extra-large has-padding-bottom-extra-large">`;
		html += buildProductDirectoryTitle(yamlObj.productDirectory);

		if (yamlObj.productDirectory.items) {
			let categories = await getAllSortedCategories(yamlObj.productDirectory.items);
			html += `<div class="columns">`;
			let facet = await buildHubFacet(categories);

			if (facet) {
				html += facet;
				html += `<div class="column">`;

				html +=
					'<div id="product-cards" class="columns is-multiline has-padding-small has-padding-none-tablet" data-bi-name="hub-product-card">';
				html += buildHubFacetSectionTitle('Featured');
				for (let item of yamlObj.productDirectory.items) {
					html += await buildHubFacetSectionItem(item, yamlObj);
					categories = await buildHubFacetSectionAllBox(categories, item);
				}
				for (let key in categories) {
					let title = isSpecialTitle(key);
					if (title.length == 0) {
						title = common.toTitleCase(common.replaceHypen(key, ' ', true), ['of', 'and']);
					}
					cardsAll += `<div class="box">
					<h3 class="title has-margin-top-none has-margin-bottom-small">${title}</h3>`;
					cardsAll += `<ul class="grid is-3 has-margin-left-none has-margin-bottom-large">`;
					cardsAll += categories[key];
					cardsAll += `</ul>`;
					cardsAll += `</div>`;
				}
				html += '</div>'; // end product-cards
				html += buildHubFacetSectionAll(cardsAll);
				html += '</div>';
			} else {
				html += `<div class="column">`;
				html += `<div id="product-cards" class="columns is-multiline " data-bi-name="hub-product-card">`;
				for (let item of yamlObj.productDirectory.items) {
					html += await buildProductDirectoryItem(
						item,
						yamlObj.productDirectory.items.indexOf(item),
						yamlObj,
						yamlObj.productDirectory.items.length
					);
				}
				html += '</div> </div>';
			}
		}
	}
	html += '</div></section>';

	return html;
}
function buildProductDirectoryTitle(yamlObj: any) {
	let title = common.getTitle(yamlObj);
	if (title) {
		let aria = common.convertHyphenAlpha(common.getTitle(yamlObj));
		return `<h2 class="has-margin-top-none has-margin-bottom-large heading-anchor" id="${aria}">
							<a class="anchor-link docon docon-link" href="#${aria}" aria-labelledby="${aria}"></a>
						${title}</h2>`;
	} else return '';
}
async function buildProductDirectoryItem(
	item: any,
	index?: number,
	yamlObj?: any,
	numItem?: number
) {
	let html = '';
	let allCards = '';
	html += `${getItemDiv(numItem)}	
						<div class="box has-margin-none is-full-height has-padding-large">`;
	html += buildProductDirectoryItemImage(item, yamlObj);
	html += buildProductDirectoryItemTitle(item, index);
	html += buildProductDirectoryItemSummary(item);
	if (item.links) {
		html += `<ul class="has-line-height-reset has-margin-left-none has-margin-bottom-none has-margin-top-extra-small">`;
		for (let link of item.links) {
			html += buildProductDirectoryItemLink(link);
		}
		html += '</ul>';
	}
	html += '</div></div>';
	return html;
}
function buildProductDirectoryItemSummary(item: any) {
	return `<p class="has-margin-none has-text-subtle is-size-small has-line-height-reset">
  ${common.getSummary(item)}</p>`;
}
function buildProductDirectoryItemTitle(item: any, index: any) {
	return `<h3 id="${common.convertHyphenAlphaCounter(common.getTitle(item), index)}" 
	class="is-size-h6 has-margin-none">${common.getTitle(item)}</h3>`;
}
function buildProductDirectoryItemImage(item: any, yamlObj?: any) {
	return `<img src="${getImageUrl(common.getImageSrc(item), yamlObj)}" 
	alt="" loading="lazy" width="48" height="48" class="image is-48x48 has-margin-bottom-small" data-linktype="relative-path">`;
}
function buildProductDirectoryItemLink(link: any) {
	let html = '';
	html += `<li class="is-unstyled has-margin-bottom-small"><a href="${common.getUrl(link)}" 
	class="is-block is-size-small" data-linktype="relative-path">
		${common.getText(link)}
	</a>
	</li>`;
	return html;
}
//productDirectory facet
async function buildHubFacet(categories: any) {
	let html = '';
	if (Object.keys(categories).length > 0) {
		html += `<div id="hub-facet-list" class="column is-narrow">
  					<nav class="is-hidden-mobile" role="navigation" data-bi-name="hub-facet">
    					<ul class="has-margin-none">`;
		if ('featured' in categories) {
			html += `<li class="is-unstyled ">
                <button data-facet="all" class="featured-facet hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-" aria-pressed="false">
                All</button>
							  </li>
							  <li class="is-unstyled has-border-bottom has-padding-bottom-extra-small has-margin-bottom-extra-small">
                <button data-facet="featured" class="all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light" aria-pressed="true">
                Featured</button>
      			  	</li>`;
		} else {
			html += `<li class="is-unstyled">
						<button data-facet="all" class="all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light" aria-pressed="true">
						All</button>
						</li>`;
		}
		for (let key in categories) {
			if (key != 'featured') {
				html += buildHubFacetButton(key);
			}
		}
		html += `</ul></nav></div>`;
	}
	return html;
}
function buildHubFacetButton(name: string) {
	let title = isSpecialTitle(name);
	if (title.length == 0) {
		title = common.toTitleCase(common.replaceHypen(name, ' ', true), ['of', 'and']);
	}
	return `<li class="is-unstyled">
  					<button data-facet="${name}" class="hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-" aria-pressed="false">
  					${title}</button>
					</li>`;
}
async function buildHubFacetSectionItem(item: any, yamlObj?: any) {
	let html = '';
	let title = isSpecialTitle(item.azureCategories.join(' '));
	if (title.length == 0) {
		title = common.toTitleCase(common.replaceHypen(item.azureCategories.join(' '), ' ', true), [
			'of',
			'and'
		]);
	}
	html += `<div class="column is-4-tablet is-3-desktop is-one-fifth-widescreen item-column" data-categories="${title}" >	
						<a href="${common.getUrl(item)}"
						 class="is-hidden-mobile box has-margin-none is-full-height has-heavy-shadow-hover has-border-high-contrast-hover has-padding-large is-undecorated" aria-labelledby="--" data-linktype="relative-path">
							 <img src="${getImageUrl(common.getImageSrc(item), yamlObj)}" 
							 alt="" loading="lazy" width="48" height="48" class="image is-48x48 has-margin-bottom-small" data-linktype="external">
              <h3 id="---" class="is-size-h6 has-margin-none">${common.getTitle(item)}</h3>
						<p class="has-margin-none has-text-subtle is-size-small has-line-height-reset">
						${common.getSummary(item)}</p>
  					</a>`;
	if (item.links) {
		html += `<ul class="has-line-height-reset has-margin-left-none has-margin-bottom-none has-margin-top-extra-small">`;
		for (let link of item.links) {
			html += buildProductDirectoryItemLink(link);
		}
		html += '</ul>';
	}
	html += '</div>';
	return html;
}
function buildHubFacetSectionTitle(title: string) {
	return `<div id="section-title" class="column is-full">
            <h3 class="has-margin-none">${title}</h3>
          </div>`;
}
function buildHubFacetSectionAll(cards: string) {
	let html = '';
	html += `<div id="product-cards-all" class="has-margin-top-none" hidden = "hidden">`;
	html += cards;
	html += `</div>`;
	return html;
}
async function buildHubFacetSectionAllBox(categories: any, item: any) {
	if (item.azureCategories) {
		for (let category of item.azureCategories) {
			categories[category] =
				categories[category] +
				buildHubFacetSectionAllBoxListItem(
					common.getTitle(item),
					common.getSummary(item),
					common.getUrl(item)
				);
		}
	}
	return categories;
}
function buildHubFacetSectionAllBoxListItem(title: string, summary: string, url: string) {
	return `<li class="grid-item">
  <div class="card is-shadowless">
    <div class="card-content has-padding-none">
      <a href="${url}" class="card-content-title" data-linktype="absolute-path">
        <h4 class="has-margin-none">${title}</h4>
      </a>
      <p class="card-content-description">${summary}</p>
    </div>
  </div>
</li>`;
}
function buildHubFacetDropDown() {}
async function getAllSortedCategories(items: any) {
	let categories: any = {};
	for (let item of items) {
		if (item.azureCategories) {
			for (let category of item.azureCategories) {
				categories[category] = '';
			}
		}
	}
	return common.sortByKey(categories);
}
function isSpecialTitle(title: string) {
	switch (title) {
		case 'iot':
			return 'Internet of Things';
		case 'ai-machine-learning':
			return 'AI + Machine Learning';
		default:
			return '';
	}
}
