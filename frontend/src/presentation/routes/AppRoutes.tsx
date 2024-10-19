import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/pages/layout/Layout";
import QuestionsPage from "presentation/pages/QuestionManagement";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";
import HomePage from "presentation/pages/HomePage";
import { ProtectedRoute } from "presentation/pages/ProtectedRoute";
import { AdminProtectedRoute } from "presentation/pages/AdminProtectedRoute";
import { MatchmakingProvider } from "domain/context/MatchmakingContext";

const AppRoutes: React.FC = () => {
    return (
        <MatchmakingProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AdminProtectedRoute />}>
                            <Route path="/questions" element={<QuestionsPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </MatchmakingProvider>
    );
};

export default AppRoutes;
