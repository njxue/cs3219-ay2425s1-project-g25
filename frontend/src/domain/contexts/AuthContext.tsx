import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean | undefined;
    isUserAdmin: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    register: (email: string, password: string, username: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const loggedInUserString = localStorage.getItem("user");
        if (loggedInUserString != null) {
            const loggedInUserObj = JSON.parse(loggedInUserString);
            setUser(loggedInUserObj);
            setIsLoggedIn(true);
        } else {
            setUser(null);
            setIsLoggedIn(false);
        }
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        try {
            const userData = await userUseCases.loginUser(email, password);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            setIsLoggedIn(true);
            return userData;
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
        console.log(res);
        localStorage.removeItem("user");
        setUser(null);
        setIsLoggedIn(false);
    };

    const register = async (email: string, password: string, username: string): Promise<User> => {
        try {
            const userData = await userUseCases.registerUser(username, email, password);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            setIsLoggedIn(true);
            return userData;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const isUserAdmin = isLoggedIn === true && user != null && user.isAdmin;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isUserAdmin, login, logout, register }}>
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
