// ### YamlMime:Hub
import * as common from '../common';

export function buildHero(yamlObj: any) {
	let brand = common.getBrand(yamlObj);
	if (!brand) brand = 'has-background-docs';
	return `<section id="hero" class="hero has-background-${brand} ">
            <div class="uhf-container has-text-${common.getBrand(yamlObj)}-invert">
              <div class="columns">
                <div class="column is-10-desktop">
                  <div class="has-padding-top-extra-large has-padding-bottom-extra-large">
										<h1 id="hero-title" class="title">
										${common.getTitle(yamlObj)}</h1>
											<p id="hero-summary" class="has-margin-none has-padding-top-medium">
											${common.getSummary(yamlObj)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>`;
}

export function getHomeDir(yamlObj: any) {
	if (yamlObj.brand) return yamlObj.brand;
	const metadata = common.getMetadata(yamlObj);
	if (metadata) {
		const product = common.getMsProduct(metadata);
		const service = common.getMsService(metadata);
		return service ? service.replace('vs-', '') : product.replace('vs-', '');
	}
	return '';
}

// guess max items per row ,  sucsss 9/10
export function getItemDiv(num: number) {
	if (num % 4 !== 0) return `<div class="column is-4-tablet is-4-desktop" data-categories="">`;
	else return `<div class="column is-6-tablet is-3-desktop" data-categories="">`;
}

export function buildTextLink(textLink: string) {
	return `<a href="${getLinkAddress(textLink)}" 
                data-linktype="absolute-path">
                ${getLinkText(textLink)}</a>`;
}

export function buildSectionHeader(title: string) {
	const aria = common.convertHyphenAlpha(title);
	return `<h2 class="has-margin-top-none heading-anchor" id="${aria.toLowerCase()}">
      <a class="anchor-link docon docon-link" href="#${aria.toLowerCase()}" aria-labelledby="${aria.toLowerCase()}">
      </a>${title}</h2>`;
}

export function buildSectionSummary(summary: string) {
	return `<p class="has-margin-top-none has-margin-bottom-large">${summary}
  </p>`;
}

// mardown links [text]:(link)
export function getLinkText(text: string) {
	const matches = text.match(/\[(.*?)\]/);
	if (matches) {
		return matches[1];
	} else return '';
}

export function getLinkAddress(text: string) {
	const matches = text.match(/\(([^)]+)\)/);
	if (matches) {
		return matches[1];
	} else return '';
}

export function getImageUrl(link: string, yamlObj: any) {
	if (link.startsWith('http')) return link;
	else if (link.startsWith('.')) link = common.replaceDot(link, '');
	else if (link.startsWith('~')) link = getHomeDir(yamlObj) + common.replaceTilde(link, '');
	else if (!link.startsWith('/')) link = '/' + link;
	const brand = common.getBrand(yamlObj);
	const formatBrand = common.replaceHypen(brand, '', true);
	let newLink = `https://docs.microsoft.com/en-us/${formatBrand}${link}`;
	if (yamlObj.title) {
		if (yamlObj.title === 'Enterprise Mobility + Security Documentation')
			return `https://docs.microsoft.com/en-us/enterprise-mobility-security${link}`;
	}
	if (yamlObj.title) {
		if (yamlObj.title === 'Mixed Reality documentation')
			return `https://docs.microsoft.com/en-us/windows/mixed-reality/${link}`;
	}
	if (brand) {
		const metadata = common.getMetadata(yamlObj);
		if (metadata) {
			const product = common.getMsProduct(metadata);
			const service = common.getMsService(metadata);
			if (product) {
				if (brand !== product)
					newLink = `https://docs.microsoft.com/en-us/${formatBrand}/${product}${link}`;
			} else if (service) {
				if (brand !== service)
					newLink = ` https://docs.microsoft.com/en-us/${formatBrand}/${service}${link}`;
			}
		}
	}
	return newLink;
}

export function isSpecialTitle(title: string) {
	if (title === 'iot') {
		return 'Internet of Things';
	} else if (title === 'ai-machine-learning') {
		return 'AI + Machine Learning';
	} else return '';
}
