export interface DocFxMetadata {
	build: {
		fileMetadata?: {
			[key: string]: {
				[glob: string]: boolean | string | string[];
			};
		};
		globalMetadata?: {
			[key: string]: boolean | string | string[];
		};
	};
}
