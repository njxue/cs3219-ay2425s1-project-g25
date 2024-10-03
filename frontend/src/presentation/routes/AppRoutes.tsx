import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/components/Layout";
import QuestionsPage from "presentation/pages/QuestionsPage";
import NotFound from "presentation/pages/NotFound";
import RegisterPage from "presentation/pages/RegisterPage";
import LoginPage from "presentation/pages/LoginPage";

const AppRoutes: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/questions" />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
};

export default AppRoutes;
