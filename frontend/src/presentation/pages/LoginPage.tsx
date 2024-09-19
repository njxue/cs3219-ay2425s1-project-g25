import React, { useState } from "react";
import { AuthRepositoryImpl } from "data/repositories/AuthRepositoryImpl";

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const authRepository = new AuthRepositoryImpl();

	const handleLogin = async () => {
		const user = await authRepository.login(email, password);
		if (!user) {
			setError("Invalid login credentials");
		} else {
			// Handle successful login
			setError(null);
			console.log("User logged in:", user);
		}
	};

	return (
		<div>
			<h1>Login</h1>
			{error && <p>{error}</p>}
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="Email"
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
			/>
			<button onClick={handleLogin}>Login</button>
		</div>
	);
};

export default LoginPage;
