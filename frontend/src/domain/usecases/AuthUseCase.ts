import { User } from 'domain/entities/User';

export interface AuthUseCase {
    login(email: string, password: string): Promise<User | null>;
}
