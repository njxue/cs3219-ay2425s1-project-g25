import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "presentation/components/Layout";
import WorkspacePage from "presentation/pages/WorkspacePage";

const AppRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/workspace" />} />

			<Route
				path="/workspace"
				element={
					<Layout>
						<WorkspacePage />
					</Layout>
				}
			/>
		</Routes>
	);
};

export default AppRoutes;
