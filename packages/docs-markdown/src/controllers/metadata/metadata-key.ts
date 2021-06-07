/**
 * See: https://aka.ms/docs/required-metadata
 */
export type MetadataKey =
	| 'author'
	| 'contributors_to_exclude'
	| 'description'
	| 'dev_langs'
	| 'f1_keywords'
	| 'helpviewer_keywords'
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
	| 'ROBOTS'
	| 'social_image_url'
	| 'title'
	| 'titleSuffix';

/**
 * See: https://review.docs.microsoft.com/en-us/help/contribute/metadata-attributes?branch=master#required-metadata
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

export const isOptional = (type: MetadataKey): boolean => !isRequired(type);
