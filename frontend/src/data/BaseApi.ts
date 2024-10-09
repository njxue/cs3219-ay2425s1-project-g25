import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import API_URL from "../config";
import { userUseCases } from "domain/usecases/UserUseCases";
import AuthClientStore from "./auth/AuthClientStore";

export class BaseApi {
    private axiosInstance: AxiosInstance;
    private protectedAxiosInstance: AxiosInstance;

    constructor(baseUrl: string) {
        this.axiosInstance = axios.create({
            baseURL: API_URL + baseUrl,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });
        this.protectedAxiosInstance = axios.create({
            baseURL: API_URL + baseUrl,
            timeout: 10000,
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        });

        const protectedReqConfigMiddleware = (req: any) => {
            if (!req.headers["Authorization"]) {
                const accessToken = AuthClientStore.getAccessToken();
                req.headers["Authorization"] = `Bearer ${accessToken}`;
            }
            return req;
        };

        const protectedReqErrMiddleware = (err: AxiosError) => {
            return Promise.reject(err);
        };

        const protectedResErrMiddleware = async (err: AxiosError) => {
            const prevRequest = err?.config;
            if (prevRequest && err?.response?.status === 403) {
                try {
                    // Eject to prevent infinite loop
                    this.protectedAxiosInstance.interceptors.response.eject(id);
                    const res = await userUseCases.refreshToken();
                    const newAccessToken = res.data;
                    prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    AuthClientStore.setAccessToken(newAccessToken);
                    return this.protectedAxiosInstance(prevRequest);
                } catch (err) {
                    console.log(err);
                    return Promise.reject(err);
                }
            }
            return Promise.reject(err);
        };

        this.protectedAxiosInstance.interceptors.request.use(protectedReqConfigMiddleware, protectedReqErrMiddleware);
        const id = this.protectedAxiosInstance.interceptors.response.use(
            (response) => response,
            protectedResErrMiddleware
        );
    }

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }
    protected async protectedGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.get<T>(url, config);
        return response.data;
    }

    protected async protectedPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.post<T>(url, data, config);
        return response.data;
    }

    protected async protectedPut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.put<T>(url, data, config);
        return response.data;
    }

    protected async protectedDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.protectedAxiosInstance.delete<T>(url, config);
        return response.data;
    }
}
