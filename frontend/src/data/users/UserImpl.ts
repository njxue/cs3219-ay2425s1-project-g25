import { IUser, IUserRegisterInput } from "domain/users/IUser";
import { mockUser } from "./mockUser";
import { userRemoteDataSource } from "./UserRemoteDataSource";
import { User } from "domain/entities/User";

const USE_MOCK_API = true;
export class UserImpl implements IUser {
    private dataSource = USE_MOCK_API ? mockUser : userRemoteDataSource;

    async registerUser(user: IUserRegisterInput): Promise<User> {
        return this.dataSource.registerUser(user);
    }
}