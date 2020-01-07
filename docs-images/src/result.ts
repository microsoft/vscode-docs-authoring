export interface Result {
    wasCompressed: boolean;
    wasResized: boolean;
    file: string;
    before?: string;
    originalSize?: number;
    after?: string;
    compressedSize?: number;
    reduction?: string;
}