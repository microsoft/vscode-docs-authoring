// ### YamlMime:Hub
import * as common from './common';
export function buildHeader(yamlObj: any) {
	let brand = common.getBrand(yamlObj);
	if (!brand) brand = 'has-background-docs';
	return `<section id="hero" class="hero has-background-${brand} ">
            <div class="uhf-container has-text-${common.getBrand(yamlObj)}-invert">
              <div class="columns">
                <div class="column is-10-desktop">
                  <div class="has-padding-top-extra-large has-padding-bottom-extra-large">
                    <h1 id="hero-title" class="title">${common.getTitle(yamlObj)}</h1>
                      <p id="hero-summary" class="has-margin-none has-padding-top-medium">${common.getSummary(
												yamlObj
											)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>`;
}
// highlightedContent section
// Maximum of 8 itemshighlightedContent:
// itemType: architecture | concept | deploy | download | get-started | how-to-guide | learn | overview | quickstart | reference | tutorial | video | whats-new
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

// conceptualContent section
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

// productDirectory section
export async function buildProductDirectory(yamlObj: any) {
	let html = '';
	if (yamlObj.productDirectory) {
		html += `<section id="product-directory" class="has-background-alternating-grey">
							<div class="uhf-container anchor-headings has-padding-top-extra-large has-padding-bottom-extra-large">`;
		html += buildProductDirectoryTitle(yamlObj.productDirectory);

		if (yamlObj.productDirectory.items) {
			html += `<div class="columns">`;
			let facet = await buildHubFacet(await getAllSortedCategories(yamlObj.productDirectory.items));

			if (facet) {
				html += facet;
				html += `<div class="column">`;

				html +=
					'<div id="product-cards" class="columns is-multiline has-padding-small has-padding-none-tablet" data-bi-name="hub-product-card">';
				html += buildHubFacetSectionTitle('Featured');
				for (let item of yamlObj.productDirectory.items) {
					html += await buildHubFacetSectionItem(item, yamlObj);
				}
				html += '</div>'; // end product-cards
				html += await buildHubFacetSectionAll(
					'', // issue
					yamlObj.productDirectory.items
				);

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
	return `<h3 id="${common.convertHyphenAlphaCounter(
		common.getTitle(item),
		index
	)}" class="is-size-h6 has-margin-none">${common.getTitle(item)}</h3>`;
}
function buildProductDirectoryItemImage(item: any, yamlObj?: any) {
	return `<img src="${getImageUrl(
		common.getImageSrc(item),
		yamlObj
	)}" alt="" loading="lazy" width="48" height="48" class="image is-48x48 has-margin-bottom-small" data-linktype="relative-path">`;
}
function buildProductDirectoryItemLink(link: any) {
	let html = '';
	html += `	<li class="is-unstyled has-margin-bottom-small"><a href="${common.getUrl(
		link
	)}" class="is-block is-size-small" data-linktype="relative-path">
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
			html += ` <li class="is-unstyled ">
                <button data-facet="all" class="featured-facet hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-" aria-pressed="false">
                All</button>
							  </li>
							  <li class="is-unstyled has-border-bottom has-padding-bottom-extra-small has-margin-bottom-extra-small">
                <button data-facet="featured" class="all-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content- has-background-secondary-light" aria-pressed="true">
                Featured</button>
      			  	</li>`;
		} else {
			html += `<li class="is-unstyled ">
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
	let title = '';
	if (name == 'iot') {
		title = 'Internet of Things';
	} else if (name == 'ai-machine-learning') {
		title = 'AI + Machine Learning';
	} else {
		title = common.toTitleCase(common.replaceHypen(name, ' ', true), ['of', 'and']);
	}
	return `<li class="is-unstyled">
  					<button data-facet="${name}" class="hub-facet button has-inner-focus is-full-width has-flex-justify-content-space-between is-text is-small has-text-weight-semibold justify-content-" aria-pressed="false">
  					${title}</button>
					</li>`;
}

async function buildHubFacetSectionItem(item: any, yamlObj?: any) {
	let html = '';
	html += `<div class="column is-4-tablet is-3-desktop is-one-fifth-widescreen item-column" data-categories="${common.toTitleCase(
		common.replaceHypen(item.azureCategories.join(' '), ' ', true)
	)}" >	
            <a href="${common.getUrl(
							item
						)}" class="is-hidden-mobile box has-margin-none is-full-height has-heavy-shadow-hover has-border-high-contrast-hover has-padding-large is-undecorated" aria-labelledby="--" data-linktype="relative-path">
               <img src="${getImageUrl(
									common.getImageSrc(item),
									yamlObj
								)}" alt="" loading="lazy" width="48" height="48" class="image is-48x48 has-margin-bottom-small" data-linktype="external">
              <h3 id="---" class="is-size-h6 has-margin-none">${common.getTitle(item)}</h3>
            <p class="has-margin-none has-text-subtle is-size-small has-line-height-reset">${common.getSummary(
							item
						)}</p>
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

async function buildHubFacetSectionAll(title: string, items: any) {
	let html = '';
	html += `<div id="product-cards-all" class="has-margin-top-none" hidden = "hidden">`;
	html += await buildHubFacetSectionAllBox(title, items);
	html += `</div>`;
	return html;
}

async function buildHubFacetSectionAllBox(title: string, items: string[]) {
	let html = '';
	html += `<div class="box">
            <h3 class="title has-margin-top-none has-margin-bottom-small">${title}</h3>
          <ul class="grid is-3 has-margin-left-none has-margin-bottom-large">`;
	for (let item of items) {
		html += buildHubFacetSectionAllBoxListItem(
			common.getTitle(item),
			common.getSummary(item),
			common.getUrl(item)
		);
	}
	html += `</ul> </div>`;
	return html;
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

// additionalContent section
// Supports up to 3 sections
export async function buildAdditionalContent(yamlObj: any) {
	let html = '';
	if (yamlObj.additionalContent) {
		if (yamlObj.additionalContent.sections) {
			html += `<section id="additional-content" class="has-background-alternating-grey has-padding-top-extra-large has-padding-bottom-extra-large">
              <div class="uhf-container anchor-headings">`;
			for (let section of yamlObj.additionalContent.sections) {
				html += buildAdditionalContentTitle(common.getTitle(section));
				html += buildSectionSummary(common.getSummary(section));
				if (section.items) {
					html += `<div class="columns is-multiline">`;
					let itemsNum = section.items.length;
					for (let item of section.items) {
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
	let aria = common.convertHyphenAlpha(title);
	return `<h2 class="has-margin-top-none has-margin-bottom-large heading-anchor" id="${aria.toLowerCase()}">
      <a class="anchor-link docon docon-link" href="#${aria.toLowerCase()}" aria-labelledby="${aria.toLowerCase()}">
      </a>${title}</h2>`;
}
async function buildAdditionalContentSectionItem(item: any, numItem: number) {
	let html = '';
	html += getItemDiv(numItem);
	let url = common.getUrl(item);
	if (url) html += buildAdditionalContentSectionItemUrl(item);
	else html += `<div class="additional-card box is-block is-full-height has-padding-large">`;
	html += buildAdditionalContentSectionItemTitle(item);
	html += `<div class="has-text-subtle is-size-small has-line-height-reset"></div>`;
	html += buildAdditionalContentSectionItemSummary(item);

	if (item.links) {
		html += `<ul class="has-line-height-reset has-margin-left-none has-margin-bottom-none has-margin-top-extra-small">`;
		for (let link of item.links) {
			html += buildAdditionalContentSectionItemLink(link);
		}
		html += '</ul>';
	}

	if (url) html += '</a>';
	else html += '</div>';

	html += '</div>';
	return html;
}

function buildAdditionalContentSectionItemUrl(item: any) {
	return `<a href="${common.getUrl(
		item
	)}" class="additional-card box is-full-height has-heavy-shadow-hover has-border-high-contrast-hover has-padding-large is-undecorated" 
        aria-labelledby="-net-core-api-reference-0" data-linktype="relative-path">	`;
}
function buildAdditionalContentSectionItemTitle(item: any) {
	return `<h3 class="is-size-h6 has-margin-top-none has-margin-bottom-small">${common.getTitle(
		item
	)}</h3>`;
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
  </a> `;

	html += buildAdditionalContentSectionItemLinkNote(link);
	html += '</li>';
	return html;
}
function buildAdditionalContentSectionItemLinkNote(link: any) {
	return `<span class="has-text-subtle"> ${common.getNote(link)}</span>`;
}

function buildAdditionalContentSectionFooter(yamlObj: any) {
	let footer = common.getFooter(yamlObj);
	let footerHtml = footer;
	if (footer) {
		let links = footer.match(/\[(.*?)\]\(.*?\)/gm);
		for (let link of links) {
			footerHtml = footerHtml.replace(link, buildTextLink(link));
		}
	}
	return `<div class="columns">
              <div class="column is-12 is-size-small has-line-height-reset">
                <p>${footerHtml} </p>
              </div>
            </div>`;
}

// common
function getHomeDir(yamlObj: any) {
	if (yamlObj.brand) return yamlObj.brand;
	if (yamlObj.metadata) {
		if (yamlObj.metadata['ms.service']) return yamlObj.metadata['ms.service'].replace('vs-', '');
		else if (yamlObj.metadata['ms.prod']) {
			return yamlObj.metadata['ms.prod'].replace('vs-', '');
		}
	}
}

// guess max items per row ,  sucsss 9/10
function getItemDiv(num: number) {
	if (num % 4 != 0) return `<div class="column is-4-tablet is-4-desktop" data-categories="">`;
	else return `<div class="column is-6-tablet is-3-desktop" data-categories="">`;
}
function buildTextLink(textLink: string) {
	return ` <a href="${getLinkAddress(textLink)}" 
                data-linktype="absolute-path">
                ${getLinkText(textLink)}</a>`;
}
function buildSectionHeader(title: string) {
	let aria = common.convertHyphenAlpha(title);
	return `<h2 class="has-margin-top-none heading-anchor" id="${aria.toLowerCase()}">
      <a class="anchor-link docon docon-link" href="#${aria.toLowerCase()}" aria-labelledby="${aria.toLowerCase()}">
      </a>${title}</h2>`;
}

function buildSectionSummary(summary: string) {
	return `<p class="has-margin-top-none has-margin-bottom-large">${summary}
  </p>`;
}

//  mardown links [text]:(link)
function getLinkText(text: string) {
	var matches = text.match(/\[(.*?)\]/);
	if (matches) {
		return matches[1];
	} else return '';
}

function getLinkAddress(text: string) {
	var matches = text.match(/\(([^)]+)\)/);
	if (matches) {
		return matches[1];
	} else return '';
}

function getImageUrl(link: string, yamlObj: any) {
	if (link.startsWith('http')) return link;
	else if (link.startsWith('.')) link = common.replaceDot(link, '');
	else if (link.startsWith('~')) link = getHomeDir(yamlObj) + common.replaceTilde(link, '');
	else if (!link.startsWith('/')) link = '/' + link;
	let brand = common.replaceHypen(common.getBrand(yamlObj), '');
	let newLink = `https://docs.microsoft.com/en-us/${brand}${link}`;
	if (yamlObj.title) {
		if (yamlObj.title == 'Enterprise Mobility + Security Documentation')
			return `https://docs.microsoft.com/en-us/enterprise-mobility-security${link}`;
	}
	if (yamlObj.title) {
		if (yamlObj.title == 'Mixed Reality documentation')
			return `https://docs.microsoft.com/en-us/windows/mixed-reality/${link}`;
	}
	if (brand) {
		if (yamlObj.metadata) {
			if (yamlObj.metadata['ms.prod']) {
				if (yamlObj.brand != yamlObj.metadata['ms.prod'])
					newLink = `https://docs.microsoft.com/en-us/${brand}/${yamlObj.metadata['ms.prod']}${link}`;
			} else if (yamlObj.metadata['ms.service']) {
				if (yamlObj.brand != yamlObj.metadata['ms.service'])
					newLink = ` https://docs.microsoft.com/en-us/${brand}/${yamlObj.metadata['ms.service']}${link}`;
			}
		}
	}
	return newLink;
}
