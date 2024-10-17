import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/components/Layout";
import QuestionsPage from "presentation/pages/QuestionsPage";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";
import HomePage from "presentation/pages/HomePage";
import { ProtectedRoute } from "presentation/pages/ProtectedRoute";
import { AdminProtectedRoute } from "presentation/pages/AdminProtectedRoute";
import { UserProvider } from "domain/contexts/userContext";
import { MatchmakingProvider } from "application/context/MatchmakingContext";
import { MatchmakingProvider } from "application/context/MatchmakingContext";

const AppRoutes: React.FC = () => {
    return (
        <UserProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="" element={<ProtectedRoute />}>
                    <Route path="" element={<AdminProtectedRoute />}>
                        <Route path="/questions" element={<QuestionsPage />} />
                    </Route>
                    <Route path="/home" element={<HomePage />} />
                </Route>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
            <MatchmakingProvider>
                <Layout>
                    <Routes>
                        <Route path="/questions" element={<QuestionsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </MatchmakingProvider>
            <MatchmakingProvider>
                <Layout>
                    <Routes>
                        <Route path="/questions" element={<QuestionsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </MatchmakingProvider>
        </UserProvider>
    );
};

export default AppRoutes;
