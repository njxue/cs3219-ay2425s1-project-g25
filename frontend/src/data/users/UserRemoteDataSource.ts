import { BaseApi } from "data/BaseApi";
import { IUserLoginInput, IUserRegisterInput } from "domain/users/IUser";

const API_URL = ''

export class UserRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async registerUser(user: IUserRegisterInput) {
        return await this.post<any>('/users/register', user);
    }

    async loginUser(user: IUserLoginInput) {
        return await this.post<any>('/auth/login', user);
    }
}

export const userRemoteDataSource = new UserRemoteDataSource();
