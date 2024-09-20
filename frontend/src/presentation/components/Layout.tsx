import React from "react";
import { Layout as AntLayout, Menu } from "antd";
import { Link } from "react-router-dom";

const { Header, Footer, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const menuItems = [
		{
			key: "1",
			label: <Link to="/workspace">Workspace</Link>,
		},
	];

	return (
		<AntLayout style={layoutStyle}>
			<Header style={headerStyle}>
				<div style={logoStyle}>My App</div>
				<Menu
					theme="light"
					mode="horizontal"
					defaultSelectedKeys={["1"]}
					style={menuStyle}
					items={menuItems}
				/>
			</Header>
			<Content style={contentStyle}>
				<div style={glassContainerStyle}>{children}</div>
			</Content>
			<Footer style={footerStyle}>
				©2024 CS3219-Team25 - All Rights Reserved
			</Footer>
		</AntLayout>
	);
};

export default Layout;

const layoutStyle: React.CSSProperties = {
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column",
	background: "rgba(255, 255, 255, 0.2)",
	maxWidth: "1200px;",
};

const headerStyle: React.CSSProperties = {
	backdropFilter: "blur(10px)",
	backgroundColor: "rgba(255, 255, 255, 0.2)",
	borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: "0 50px",
};

const logoStyle: React.CSSProperties = {
	fontSize: "1.5rem",
	fontWeight: "bold",
	color: "#fff",
};

const menuStyle: React.CSSProperties = {
	background: "transparent",
	border: "none",
};

const contentStyle: React.CSSProperties = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-start",
	alignItems: "center",
	background: "rgba(255, 255, 255, 0.05)",
	overflowY: "auto",
	padding: "30px 0",
};

const glassContainerStyle: React.CSSProperties = {
	background: "rgba(255, 255, 255, 0.15)",
	boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
	borderRadius: "15px",
	border: "1px solid rgba(255, 255, 255, 0.18)",
	backdropFilter: "blur(10px)",
	padding: "30px",
	width: "100%",
	maxWidth: "1200px",
	minHeight: "calc(100% - 60px)",
	margin: "0 auto",
	textAlign: "center",
};

const footerStyle: React.CSSProperties = {
	textAlign: "center",
	padding: "20px",
	backgroundColor: "rgba(255, 255, 255, 1)",
	borderTop: "1px solid rgba(255, 255, 255, 0.3)",
	backdropFilter: "blur(10px)",
	color: "#000",
};
