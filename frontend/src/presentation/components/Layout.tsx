import React from "react";
import { Layout as AntLayout, Menu } from "antd";
import { Link } from "react-router-dom";
import styles from "./Layout.module.css";

const { Header, Footer, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const menuItems = [
		{
			key: "1",
			label: <Link to="/workspace">Workspace</Link>,
		},
	];

	return (
		<AntLayout className={styles.layout}>
			<Header className={styles.header}>
				<div className={styles.logo}>My App</div>
				<Menu
					theme="light"
					mode="horizontal"
					defaultSelectedKeys={["1"]}
					className={styles.menu}
					items={menuItems}
				/>
			</Header>
			<Content className={styles.content}>
				<div className={styles.glassContainer}>{children}</div>
			</Content>
			<Footer className={styles.footer}>
				©2024 CS3219-Team25 - All Rights Reserved
			</Footer>
		</AntLayout>
	);
};

export default Layout;
