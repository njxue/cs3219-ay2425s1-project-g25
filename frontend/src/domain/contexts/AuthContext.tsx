import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AuthClientStore from "data/auth/AuthClientStore";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean | undefined;
    isUserAdmin: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    register: (email: string, password: string, username: string) => Promise<User>;
    refresh: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const verifyAccessToken = async () => {
            const res = await userUseCases.verifyToken();
            const user = res.data;
            if (!user) {
                setUser(null);
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
                setUser(user);
            }
        };
        if (!AuthClientStore.containsAccessToken()) {
            setIsLoggedIn(false);
            setUser(null);
        } else {
            verifyAccessToken();
        }
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const userAndAccessToken = await userUseCases.loginUser(email, password);
            const user = userAndAccessToken.user;
            const accessToken = userAndAccessToken.accessToken;
            setUser(user);
            setIsLoggedIn(true);
            AuthClientStore.setAccessToken(accessToken);
            return user;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const logout = async () => {
        if (!user) {
            // TODO: proper handling
            return;
        }
        const res = await userUseCases.logoutUser(user._id);
        AuthClientStore.removeAccessToken();
        setUser(null);
        setIsLoggedIn(false);
    };

    const register = async (email: string, password: string, username: string): Promise<User> => {
        try {
            const userData = await userUseCases.registerUser(username, email, password);
            return userData;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const isUserAdmin = isLoggedIn === true && user != null && user.isAdmin;

    // SHOULD DELETE
    const refresh = async () => {
        try {
            const data = await userUseCases.refreshToken();
            const newAccessToken = data.accessToken;
            console.log(newAccessToken);
            localStorage.setItem("user", JSON.stringify({}));
            return newAccessToken;
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isUserAdmin, login, logout, register, refresh }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a UserProvider");
    }
    return context;
};
