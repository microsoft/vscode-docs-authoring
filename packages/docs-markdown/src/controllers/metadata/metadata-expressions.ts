import { MetadataKey } from './metadata-key';

export const metadataFrontMatterRegex = /^(?:-{3}(?<metadata>[\w\W]+?)-{3})*/gim;
export const authorRegex = /^author:\s*\B(.+?)$/im;
export const contributorsToExcludeRegex = /^contributors_to_exclude:\s*\B(.+?)$/im;
export const devLangsRegex = /^dev_langs:\s*\B(.+?)$/im;
export const managerRegex = /^manager:\s*\B(.+?)$/im;
export const msAuthorRegex = /ms.author:\s*\B(.+?)$/im;
export const msCollectionRegex = /ms.collection:\s*\B(.+?)$/im;
export const msCustomRegex = /ms.custom:\s*\B(.+?)$/im;
export const msDateRegex = /ms.date:\s*\B(.+?)$/im;
export const msDevLangRegex = /ms.devlang:\s*\B(.+?)$/im;
export const msProdRegex = /ms.prod:\s*\B(.+?)$/im;
export const msReviewerRegex = /ms.reviewer:\s*\B(.+?)$/im;
export const msServiceRegex = /ms.service:\s*\B(.+?)$/im;
export const msSubserviceRegex = /ms.subservice:\s*\B(.+?)$/im;
export const msTechnologyRegex = /ms.technology:\s*\B(.+?)$/im;
export const msTopicRegex = /ms.topic:\s*\B(.+?)$/im;
export const productRegex = /^product:\s*\B(.+?)$/im;
export const robotsRegex = /^robots:\s*\B(.+?)$/im;
export const titleSuffixRegex = /^titleSuffix:\s*\B(.+?)$/im;

export const metadataExpressions: Map<MetadataKey, RegExp> = new Map([
	['author', authorRegex],
	['contributors_to_exclude', contributorsToExcludeRegex],
	['dev_langs', devLangsRegex],
	['manager', managerRegex],
	['ms.author', msAuthorRegex],
	['ms.collection', msCollectionRegex],
	['ms.custom', msCustomRegex],
	['ms.date', msDateRegex],
	['ms.devlang', msDevLangRegex],
	['ms.prod', msProdRegex],
	['ms.reviewer', msReviewerRegex],
	['ms.service', msServiceRegex],
	['ms.subservice', msSubserviceRegex],
	['ms.technology', msTechnologyRegex],
	['ms.topic', msTopicRegex],
	['product', productRegex],
	['ROBOTS', robotsRegex],
	['titleSuffix', titleSuffixRegex]
]);
