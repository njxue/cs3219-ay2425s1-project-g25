import React from "react";
import { Layout as AntLayout } from "antd";
import styles from "./Layout.module.css";

const { Content, Header } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <p>PeerPrep</p>
            </Header>
            <Content className={styles.content}>{children}</Content>
        </AntLayout>
    );
};

export default Layout;
