import { User } from "domain/entities/User";
import { IUserRegisterInput } from "domain/users/IUser";

const users: User[] = [
    {
        _id: "1",
        username: "SampleUserName",
        email: "sample@gmail.com",
        isAdmin: false,
        createdAt: new Date()
    }
];

export class MockUser {
    private users: User[] = users;

    /**
     * Crates a new user.
     * @param user - the user to be created
     * @returns Promise resolving with the status and created user.
     */
    async registerUser(user: IUserRegisterInput): Promise<{ status: number; data: any }> {
        return new Promise((resolve, reject) => {
            try {
                const userId = (this.users.length + 1).toString();
                const newUser: User = {
                    _id: userId,
                    username: user.username,
                    email: user.email,
                    isAdmin: false,
                    createdAt: new Date()
                };
                this.users.push(newUser);

                resolve({
                    status: 201,
                    data: {
                        message: `Created new user ${user.username} successfully`,
                        data: newUser
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export const mockUser = new MockUser();
