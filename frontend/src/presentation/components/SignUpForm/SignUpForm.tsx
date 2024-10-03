import React, { useState } from "react";
import styles from "./SignUpForm.module.css";
import { userUseCases } from "domain/usecases/UserUseCases";
import { useNavigate } from "react-router-dom";
import { handleError } from "presentation/utils/errorHandler";

export const SignUpForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await userUseCases.registerUser(username, email, password);
            await userUseCases.loginUser(email, password);
            navigate("/home");
        } catch (error) {
            console.error("Failed to register and log in user", error);
            alert(handleError(error, "Failed to register and log in user"));
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Sign Up</h2>
                <label className={styles.label}>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        placeholder="Email"
                        required
                    />
                </label>
                <label className={styles.label}>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        placeholder="Username"
                        required
                    />
                </label>
                <label className={styles.label}>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        placeholder="Password"
                        required
                    />
                </label>
                <button type="submit" className={styles.button}>
                    Sign Up
                </button>
            </form>
        </div>
    );
};
