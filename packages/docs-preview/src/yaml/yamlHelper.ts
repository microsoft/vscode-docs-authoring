const icons = [
	{
		name: 'Quickstart',
		icon: 'docon-topic-quickstart'
	},
	{
		name: 'Overview',
		icon: 'docon-topic-overview'
	},
	{
		name: 'Whats-new',
		icon: 'docon-topic-whats-new'
	},
	{
		name: 'Concept',
		icon: 'docon-topic-concept'
	},
	{
		name: 'Learn',
		icon: 'docon-topic-learn'
	},
	{
		name: 'Tutorial',
		icon: 'docon-topic-tutorial'
	},
	{
		name: 'Download',
		icon: 'docon-topic-download'
	},
	{
		name: 'Architecture',
		icon: 'docon-topic-architecture'
	},
	{
		name: 'Deploy',
		icon: 'docon-topic-deploy'
	},
	{
		name: 'get-started',
		icon: 'docon-topic-get-started'
	},
	{
		name: 'how-to-guide',
		icon: 'docon-topic-how-to-guide'
	},
	{
		name: 'reference',
		icon: 'docon-topic-reference'
	},
	{
		name: 'video',
		icon: 'docon-topic-video'
	},
	{
		name: 'sample',
		icon: 'docon-topic-sample'
	}
];
export async function getTitle(yamlObj: any) {
	let title = '';
	if (yamlObj.title) {
		title = yamlObj.title;
	}
	return title;
}

export async function getSummary(yamlObj: any) {
	let summary = '';
	if (yamlObj.summary) {
		summary = yamlObj.summary;
	}
	return summary;
}

export async function getMetadata(yamlObj: any) {
	let metadata = '';
	if (yamlObj.metadata) {
		metadata = yamlObj.metadata;
	}
	return metadata;
}

// landingContent:  CardObj ---> linkLists: sectionObj --->  links : linkObj
export async function buildLandingHtml(yamlObj: any) {
	let landingHtml = '';
	if (yamlObj.landingContent) {
		for (let cardObj of yamlObj.landingContent) {
			landingHtml += buildCard(buildCardContent(cardObj));
		}
	}

	return landingHtml;
}

function buildCardContent(cardObj: any) {
	let cardContent = '';
	if (getCardTitle(cardObj)) {
		cardContent += buildCardTitle(getCardTitle(cardObj));
	}
	if (getCardSections(cardObj)) {
		cardContent += buildSections(cardObj);
	}
	return cardContent;
}

function buildSections(cardObj: any) {
	let sections = '';
	for (let sectionObj of getCardSections(cardObj)) {
		let text = '';
		let url = '';
		if (getSectionTitle(sectionObj)) {
			sections += buildSectionTitle(getSectionTitle(sectionObj));
		}
		if (getSectionLinks(sectionObj)) {
			let links = '';
			for (let linkObj of getSectionLinks(sectionObj)) {
				if (getLinkText(linkObj)) {
					text = getLinkText(linkObj);
				}
				if (getLinkUrl(linkObj)) {
					url = getLinkUrl(linkObj);
				}
				links += buildList(url, text);
			}
			sections += buildLinks(links);
		}
	}
	return sections;
}

function getLinkUrl(linkObj: any) {
	return linkObj.url;
}

function getLinkText(linkObj: any) {
	return linkObj.text;
}

function getSectionLinks(sectionObj: any) {
	return sectionObj.links;
}

function getSectionTitle(sectionObj: any) {
	return sectionObj.linkListType;
}

function getCardSections(cardObj: any) {
	return cardObj.linkLists;
}

function getCardTitle(cardObj: any) {
	return cardObj.title;
}

function buildCard(cardContent: string) {
	let html: string = '';
	html += `<div class="column is-12 is-4-desktop">
      <div class="box has-box-shadow-medium has-margin-none has-margin-small">`;
	html += cardContent;
	html += '</div> </div>';
	return html;
}

function buildCardTitle(title: string) {
	let html: string = '';
	html += '<h2 class="has-margin-none is-size-4">';
	html += title;
	html += '</h2>';
	return html;
}
function buildSectionTitle(title: string) {
	let html: string = '';
	html +=
		'<h3 class="is-flex is-uppercase is-size-7 has-border-top has-margin-bottom-small has-margin-top-medium has-padding-top-medium has-text-subtle">';
	html += titleToIcon(title);
	if (title === 'whats-new') html += 'What&#39;s new';
	else {
		html += title;
	}
	html += '</h3>';
	return html;
}
function buildList(url: string, text: string) {
	let html: string = '';
	html += '<li class="is-unstyled has-padding-top-small has-padding-bottom-small">';
	html += `
  <a class="is-size-small is-block" href="${url}" 
  data-linktype="relative-path">${text}</a>
  `;
	html += '</li>';

	return html;
}
function buildLinks(links: string) {
	return '<ul class="has-margin-none has-line-height-reset">' + links + '</ul>';
}

function titleToIcon(name: string) {
	const icon = icons.find(icon => icon.name.match(new RegExp(name, 'i')));
	return `
    <span class="has-margin-right-extra-small has-flex-align-self-center is-size-h5 docon ${icon?.icon}" aria-hidden="true"></span>
    `;
}
