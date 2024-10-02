import { User } from "domain/entities/User"

export interface IUserLoginInput {
    email: string,
    password: string,
}

export interface IAuth {
    loginUser(user: IUserLoginInput): Promise<User>;
}