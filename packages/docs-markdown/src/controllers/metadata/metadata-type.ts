/**
 * See: https://review.docs.microsoft.com/en-us/help/contribute/metadata-attributes?branch=master
 */
export type MetadataKey =
	| 'author'
	| 'contributors_to_exclude'
	| 'description'
	| 'dev_langs'
	| 'manager'
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
export const isRequired = (type: MetadataType): boolean => {
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

export const isOptional = (type: MetadataType): boolean => !isRequired(type);
