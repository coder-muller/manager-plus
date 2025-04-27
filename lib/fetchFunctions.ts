import axios, { AxiosError } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function sendGet<T>(path: string): Promise<T> {
    try {
        const response = await axios.get<T>(`${baseUrl}${path}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function sendPost<T, D>(path: string, body: D): Promise<T> {
    try {
        const response = await axios.post<T>(`${baseUrl}${path}`, body);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(error.response?.data);
        } else {
            console.error(error);
        }
        throw error;
    }
}

export async function sendPut<T, D>(path: string, body: D): Promise<T> {
    try {
        const response = await axios.put<T>(`${baseUrl}${path}`, body);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function sendDelete<T>(path: string): Promise<T> {
    try {
        const response = await axios.delete<T>(`${baseUrl}${path}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
