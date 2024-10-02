import { User } from "domain/entities/User"

export interface IUserRegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface IUser {
    registerUser(user: IUserRegisterInput): Promise<User>;
}