import { BaseApi } from "data/BaseApi";

const API_URL = '/auth'

export class AuthRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async loginUser(user: any) {
        return await this.post<any>('/login', user);
    }
}

export const authRemoteDataSource = new AuthRemoteDataSource();
