// ### YamlMime:landingContent  CardObj ---> linkLists: sectionObj --->  links : linkObj
import { getTitle, getSummary, getUrl, getText } from './common';

export function buildLandingHeader(yamlObj: any) {
	let html: string = '';
	html += `<section id="landing-head">
            <div class="has-padding-top-small has-padding-bottom-medium">
              <div class="columns">
                <div class="column is-full">
        `;
	html += '<h1 class="is-size-h2">';
	html += getTitle(yamlObj);
	html += '</h1>';
	html += '<p class="has-margin-top-small has-line-height-reset">';
	html += getSummary(yamlObj);
	html += '</p> </div> </div> </div> </section>';
	return html;
}

export async function buildLandingContentSection(yamlObj: any) {
	let html: string = '';
	html += '<section id="landing-content" class="has-padding-top-medium has-padding-bottom-medium">';
	html += '<div class="columns is-masonry is-three-masonry-columns" style="">';
	if (yamlObj.landingContent) {
		for (let cardObj of yamlObj.landingContent) {
			html += buildCard(buildCardContent(cardObj));
		}
	}
	html += '</div> </section>';
	return html;
}

function buildCardContent(cardObj: any) {
	let cardContent = '';
	if (cardObj.title) {
		cardContent += buildCardTitle(cardObj.title);
	}
	if (cardObj.linkLists) {
		cardContent += buildCardLinklist(cardObj);
	}
	return cardContent;
}

function buildCard(cardContent: string) {
	let html: string = '';
	html += `<div class="column is-12 is-4-desktop">
      <div class="box has-box-shadow-medium has-margin-none has-margin-small-desktop">`;
	html += cardContent;
	html += '</div> </div>';
	return html;
}

function buildCardTitle(title: string) {
	let html: string = '';
	html += '<h2 class="has-margin-none is-size-h6">';
	html += title;
	html += '</h2>';
	return html;
}
function buildCardLinklist(cardObj: any) {
	let sections = '';
	for (let sectionObj of cardObj.linkLists) {
		if (sectionObj.linkListType) {
			sections += buildCardLinklistTitle(sectionObj.linkListType);
		}
		if (sectionObj.links) {
			let links = '';
			for (let linkObj of sectionObj.links) {
				links += buildListItem(getUrl(linkObj), getText(linkObj));
			}
			sections += buildUnorderedList(links);
		}
	}
	return sections;
}
function buildCardLinklistTitle(title: string) {
	let html: string = '';
	html +=
		'<h3 class="is-flex is-uppercase is-size-small has-border-top has-margin-bottom-small has-margin-top-medium has-padding-top-medium has-text-subtle">';
	html += `
  <span class="has-margin-right-extra-small has-flex-align-self-center is-size-h5 docon docon-topic-${title.toLowerCase()}" aria-hidden="true"></span>
  `;
	if (title === 'whats-new') html += 'What&#39;s new';
	else {
		html += title;
	}
	html += '</h3>';
	return html;
}
function buildListItem(url: string, text: string) {
	let html: string = '';
	html += '<li class="is-unstyled has-padding-top-small has-padding-bottom-small">';
	html += `
  <a class="is-size-small is-block" href="${url}" 
  data-linktype="relative-path">${text}</a>
  `;
	html += '</li>';

	return html;
}
function buildUnorderedList(links: string) {
	return '<ul class="has-margin-none has-line-height-reset">' + links + '</ul>';
}
