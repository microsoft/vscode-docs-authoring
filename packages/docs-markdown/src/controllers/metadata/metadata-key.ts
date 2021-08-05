/**
 * See: https://aka.ms/docs/required-metadata
 */
export type MetadataKey =
	| 'apiPlatform'
	| 'author'
	| 'brand'
	| 'breadcrumb_path'
	| 'contributors_to_exclude'
	| 'description'
	| 'dev_langs'
	| 'f1_keywords'
	| 'featureFlags'
	| 'feedback_github_repo'
	| 'feedback_product_url'
	| 'feedback_system'
	| 'helpviewer_keywords'
	| 'learn_banner_products'
	| 'manager'
	| 'manager'
	| 'ms.assetid'
	| 'ms.author'
	| 'ms.collection'
	| 'ms.custom'
	| 'ms.date'
	| 'ms.devlang'
	| 'ms.prod'
	| 'ms.reviewer'
	| 'ms.service'
	| 'ms.subservice'
	| 'ms.technology'
	| 'ms.topic'
	| 'no_loc'
	| 'product'
	| 'recommendations'
	| 'ROBOTS'
	| 'searchScope'
	| 'social_image_url'
	| 'title'
	| 'titleSuffix';

export const allMetadataKeys: MetadataKey[] = [
	'apiPlatform',
	'author',
	'brand',
	'breadcrumb_path',
	'contributors_to_exclude',
	'description',
	'dev_langs',
	'f1_keywords',
	'featureFlags',
	'feedback_github_repo',
	'feedback_product_url',
	'feedback_system',
	'helpviewer_keywords',
	'learn_banner_products',
	'manager',
	'manager',
	'ms.assetid',
	'ms.author',
	'ms.collection',
	'ms.custom',
	'ms.date',
	'ms.devlang',
	'ms.prod',
	'ms.reviewer',
	'ms.service',
	'ms.subservice',
	'ms.technology',
	'ms.topic',
	'no_loc',
	'product',
	'recommendations',
	'ROBOTS',
	'searchScope',
	'social_image_url',
	'title',
	'titleSuffix'
];

export const requiredMetadataKeys: MetadataKey[] = [
	'author',
	'description',
	'ms.author',
	'ms.date',
	'ms.service',
	'ms.prod',
	'ms.topic',
	'title'
];

/**
 * See: https://aka.ms/docs/required-metadata
 */
export const isRequired = (key: MetadataKey): boolean => {
	return requiredMetadataKeys.includes(key);
};

/**
 * See: https://aka.ms/docs/optional-metadata
 */
export const isOptional = (key: MetadataKey): boolean => !isRequired(key);
