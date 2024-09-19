import { AuthUseCase } from 'domain/usecases/AuthUseCase';
import { User } from 'domain/entities/User';

export class AuthRepositoryImpl implements AuthUseCase {
    async login(email: string, password: string): Promise<User | null> {
        // Simulate API call or database interaction
        if (email === "test@example.com" && password === "password") {
            return { id: 1, name: "Test User", email: "test@example.com" };
        }
        return null;
    }
}
