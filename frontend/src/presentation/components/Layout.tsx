import React from "react";
import { Layout as AntLayout } from "antd";
import styles from "./Layout.module.css";

const { Footer, Content } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<AntLayout className={styles.layout}>
			<Content className={styles.content}>
				<div className={styles.glassContainer}>{children}</div>
			</Content>
			<Footer className={styles.footer}>
				{"©2024 CS3219-Team25 - All Rights Reserved"}
			</Footer>
		</AntLayout>
	);
};

export default Layout;
