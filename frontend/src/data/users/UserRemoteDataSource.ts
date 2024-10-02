import { BaseApi } from "data/BaseApi";

const API_URL = '/api/users'

export class UserRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async registerUser(user: any) {
        return await this.post<any>('/register', user);
    }
}

export const userRemoteDataSource = new UserRemoteDataSource();
