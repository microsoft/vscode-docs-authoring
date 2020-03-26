import { AxiosResponse, default as Axios } from "axios";

export async function getAsync(url: string): Promise<AxiosResponse> {
  try {
    return await Axios.get(url);
  } catch (err) {
    return err;
  }
}
