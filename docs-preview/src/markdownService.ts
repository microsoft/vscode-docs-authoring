import { AxiosError } from "axios";
import { HttpClient } from "./httpClient";

export default class MarkdownService {
    public static async markupAsync(content: string, filePath: string, basePath: string): Promise<string> {
        const response = await HttpClient.postAsync(content, filePath, basePath);
        return response.data.content;
    }
}
