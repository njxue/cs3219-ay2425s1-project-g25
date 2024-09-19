import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<div>
			<header>
				<nav>
					<a href="/workspace">Workspace</a> | <a href="/login">Login</a>
				</nav>
			</header>
			<main>{children}</main>
			<footer>Footer content</footer>
		</div>
	);
};

export default Layout;
