import { IUserLoginInput } from "domain/auth/IAuth";
import { authRemoteDataSource } from "./AuthRemoteDataSource";
import { mockAuth } from "./mockAuth";
import { User } from "domain/entities/User";

const USE_MOCK_API = true;
export class AuthImpl {
    private dataSource = USE_MOCK_API ? mockAuth : authRemoteDataSource;

    async loginUser(user: IUserLoginInput): Promise<User> {
        return this.dataSource.loginUser(user);
    }
}