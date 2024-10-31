import { Button, Card, Form, Input } from "antd";
import React from "react";
import styles from "./ForgotPasswordPage.module.css";
import { toast } from "react-toastify";
import EmailService from "infrastructure/services/EmailService";
import { userUseCases } from "domain/usecases/UserUseCases";

export const ForgotPasswordPage: React.FC<{}> = () => {
    const handleSendPasswordResetLink = async (input: { email: string }) => {
        const email = input.email;
        console.log(await userUseCases.forgetPassword(email));
        toast.success(input.email);
    };

    return (
        <div className={styles.container}>
            <div className={styles.forgotPasswordForm}>
                <h2>Forgot Password</h2>
                <p>
                    Forgot your password? We gotchu. Enter your email address and we'll send you a password reset link.
                </p>
                <Form layout="vertical" onFinish={handleSendPasswordResetLink}>
                    <Form.Item label="Email" name="email">
                        <Input type="email" placeholder="Your email address" />
                    </Form.Item>
                    <Button className={styles.sendBtn} htmlType="submit">
                        Send password reset link
                    </Button>
                </Form>
            </div>
        </div>
    );
};
