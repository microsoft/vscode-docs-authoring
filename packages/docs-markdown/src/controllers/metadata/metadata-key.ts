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

/**
 * See: https://aka.ms/docs/required-metadata
 */
export const isRequired = (type: MetadataKey): boolean => {
	return (
		type === 'author' ||
		type === 'description' ||
		type === 'ms.author' ||
		type === 'ms.date' ||
		type === 'ms.service' ||
		type === 'ms.prod' ||
		type === 'ms.topic' ||
		type === 'title'
	);
};

/**
 * See: https://aka.ms/docs/optional-metadata
 */
export const isOptional = (type: MetadataKey): boolean => !isRequired(type);
