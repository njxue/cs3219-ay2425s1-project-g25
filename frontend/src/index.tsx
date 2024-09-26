import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./presentation/routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppRoutes />
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                closeOnClick
                closeButton
            />
        </BrowserRouter>
    </React.StrictMode>
);
