import { MetadataKey } from './metadata-type';

export const metadataFrontMatterRegex = /^(?:-{3}(?<metadata>[\w\W]+?)-{3})*/gim;
export const authorRegex = /^author:\s*\b(.+?)$/im;
export const contributorsToExcludeRegex = /^contributors_to_exclude:\s*\b(.+?)$/im;
export const devLangsRegex = /^dev_langs:\s*\b(.+?)$/im;
export const managerRegex = /^manager:\s*\b(.+?)$/im;
export const msAuthorRegex = /ms.author:\s*\b(.+?)$/im;
export const msCollectionRegex = /ms.collection:\s*\b(.+?)$/im;
export const msCustomRegex = /ms.custom:\s*\b(.+?)$/im;
export const msDateRegex = /ms.date:\s*\b(.+?)$/im;
export const msDevLangRegex = /ms.devlang:\s*\b(.+?)$/im;
export const msProdRegex = /ms.prod:\s*\b(.+?)$/im;
export const msReviewerRegex = /ms.reviewer:\s*\b(.+?)$/im;
export const msServiceRegex = /ms.service:\s*\b(.+?)$/im;
export const msSubserviceRegex = /ms.subservice:\s*\b(.+?)$/im;
export const msTechnologyRegex = /ms.technology:\s*\b(.+?)$/im;
export const msTopicRegex = /ms.topic:\s*\b(.+?)$/im;
export const productRegex = /^product:\s*\b(.+?)$/im;
export const robotsRegex = /^robots:\s*\b(.+?)$/im;
export const titleSuffixRegex = /^titleSuffix:\s*\b(.+?)$/im;

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
