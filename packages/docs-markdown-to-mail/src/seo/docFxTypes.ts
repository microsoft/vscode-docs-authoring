export interface DocFxMetadata {
	build: {
		fileMetadata?: {
			author?: {
				[glob: string]: string;
			};
			manager?: {
				[glob: string]: string;
			};
			titleSuffix?: {
				[glob: string]: string;
			};
			'ms.author'?: {
				[glob: string]: string;
			};
			'ms.service'?: {
				[glob: string]: string;
			};
			'ms.subservice'?: {
				[glob: string]: string;
			};
		};
		globalMetadata?: {
			titleSuffix: string;
			breadcrumb_path: string;
		};
	};
}

export type MetadataType =
	| 'author'
	| 'manager'
	| 'titleSuffix'
	| 'ms.author'
	| 'ms.date'
	| 'ms.service'
	| 'ms.subservice';
