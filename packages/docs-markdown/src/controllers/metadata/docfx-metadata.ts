export interface DocFxMetadata {
	build: {
		fileMetadata?: {
			[key: string]: {
				[glob: string]: string;
			};
		};
		globalMetadata?: {
			[key: string]: {
				[glob: string]: string;
			};
		};
	};
}
