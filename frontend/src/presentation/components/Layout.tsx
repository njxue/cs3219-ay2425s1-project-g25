import React from "react";
import { Layout as AntLayout } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Layout.module.css";
import PeerPrepLogo from "../../assets/images/PeerPrepLogo.png";
import { useAuth } from "domain/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import PeerPrepLogo from "../../assets/images/PeerPrepLogo.png";
import MatchingFloatingButton from "./buttons/MatchingFloatingButton";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Content, Header } = AntLayout;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Failed to log out user", err);
        }
    };
    const location = useLocation();
    const navigate = useNavigate();

    const navigateHome = () => {
        navigate("/");
    };

    return (
        <AntLayout className={styles.layout}>
            <Header className={styles.header}>
                <img src={PeerPrepLogo} alt="PeerPrep Logo" width="7%" />
                {isLoggedIn && <LogoutOutlined onClick={handleLogout} />}
                <img src={PeerPrepLogo} alt="PeerPrep Logo" width="7%" />
                <div onClick={navigateHome} style={{ cursor: "pointer" }}>
                    <img src={PeerPrepLogo} alt="PeerPrep Logo" width="7%" />
                </div>
                <img src={PeerPrepLogo} alt="PeerPrep Logo" width="10%" />
                <div onClick={navigateHome} style={{ cursor: "pointer" }}>
                    <img src={PeerPrepLogo} alt="PeerPrep Logo" width="15%" />
                </div>
                {location.pathname !== "/" && (
                    <ArrowLeftOutlined onClick={navigateHome} className={styles.backButton} />
                )}
            </Header>
            <Content className={styles.content}>
                {children}
                <MatchingFloatingButton />
            </Content>
        </AntLayout>
    );
};

export default Layout;
