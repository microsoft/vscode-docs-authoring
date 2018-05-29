import { AxiosResponse, default as Axios } from "axios";

export class HttpClient {

    public static async postAsync(content: string, filePath: string, basePath: string): Promise<AxiosResponse> {
        try {
            return await Axios.post(this.apiUrl,
                {
                    basePath: basePath || ".",
                    content,
                    filePath,
                });
        } catch (err) {
            this.HandleError(err);
        }
    }

    public static async getAsync(querystring: string): Promise<AxiosResponse> {
        try {
            return await Axios.get(this.apiUrl + querystring);
        } catch (err) {
            this.HandleError(err);
        }
    }

    public static async exitAsync() {
        await HttpClient.getAsync(`?command=exit`);
    }

    public static async pingAsync() {
        await HttpClient.getAsync(`?command=ping`);
    }

    private static apiUrl = "http://127.0.0.1:4462";

    private static HandleError(err) {
        const response = err.response;
        if (!response) {
            throw new Error("No Service Response");
        }

        switch (response.status) {
            case 400:
                throw new Error(`[Client Error]: ${response.statusText}`);
            case 500:
                throw new Error(`[Server Error]: ${response.statusText}`);
            default:
                throw new Error(err);
        }
    }
}
