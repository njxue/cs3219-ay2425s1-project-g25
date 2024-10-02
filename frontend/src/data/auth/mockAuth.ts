import { User } from "domain/entities/User";
import { IUserLoginInput } from "domain/auth/IAuth";

const users: User[] = [
    {
        _id: "1",
        username: "SampleUserName",
        email: "sample@gmail.com",
        isAdmin: false,
        createdAt: new Date()
    }
];

export class MockAuth {
    private users: User[] = users;

    /**
     * Logs in a user, creating an access token. No password checking.
     * @param user - the user to be logged in
     * @returns Promise resolving with the status and logged in user.
     */
    async loginUser(user: IUserLoginInput) {
        return new Promise((resolve, reject) => {
            try {
                const foundUser = this.users.find((u) => u.email === user.email);
                if (!foundUser) {
                    resolve({
                        status: 401,
                        data: {
                            message: "Wrong email and/or password"
                        }
                    });
                } else {
                    foundUser.accessToken = user.email + "TOKEN";
                    resolve({
                        status: 200,
                        data: {
                            message: "User logged in",
                            data: foundUser
                        }
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

export const mockAuth = new MockAuth();
