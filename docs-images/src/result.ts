export interface Result {
    wasCompressed: boolean;
    wasResized: boolean;
    file: string;
    before?: string;
    after?: string;
    reduction?: string;
}