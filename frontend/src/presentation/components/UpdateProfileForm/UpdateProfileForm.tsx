import { Button, Form, Input } from "antd";
import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import { User } from "domain/entities/User";
import { UPDATE_PROFILE_FORM_FIELDS } from "presentation/utils/constants";
import { useEffect, useState } from "react";
import styles from "./UpdateProfileForm.module.css";
import { useAuth } from "domain/contexts/AuthContext";
import { toast } from "react-toastify";
import { handleError } from "presentation/utils/errorHandler";
import { useForm, useWatch } from "antd/es/form/Form";
import { IUserUpdateInput } from "domain/users/IUser";

interface UpdateProfileFormProps {
    user: User;
    onSubmit?: () => void;
    onCancel?: () => void;
}

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({ user, onSubmit, onCancel }) => {
    const [form] = useForm();
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const validateMessages = {
        required: "${label} is required",
        whitespace: "${label} is required"
    };

    const { updateUser } = useAuth();

    const { FIELD_USERNAME, FIELD_PASSWORD, FIELD_CONFIRM_PASSWORD, FIELD_EMAIL } = UPDATE_PROFILE_FORM_FIELDS;

    const handleCollapsePasswordFields = () => {
        resetPasswordFields();
        setIsUpdatingPassword(false);
    };
    const resetPasswordFields = () => {
        form.setFieldsValue({
            [FIELD_PASSWORD.name]: "",
            [FIELD_CONFIRM_PASSWORD.name]: ""
        });
    };
    const handleCancel = () => {
        resetPasswordFields();
        onCancel?.();
    };

    const initialFormValues = { [FIELD_USERNAME.name]: user.username, [FIELD_EMAIL.name]: user.email };

    const passwordsMatchValidator = async (_: any, value: string) => {
        if (value !== form.getFieldValue("password")) {
            return Promise.reject(new Error("Passwords do not match"));
        }
        return Promise.resolve();
    };

    const handleSubmit = async (input: IUserUpdateInput & { [key in typeof FIELD_CONFIRM_PASSWORD.name]: string }) => {
        let payload: IUserUpdateInput = { username: input.username, email: input.email };
        if (isUpdatingPassword) {
            payload = { ...payload, password: input.password };
        }
        try {
            await updateUser(payload);
            onSubmit?.();
            handleCollapsePasswordFields();
            toast.success("User profile updated");
        } catch (err) {
            console.error(err);
            toast.error(handleError(err));
        }
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={initialFormValues}
            validateMessages={validateMessages}
        >
            <Form.Item
                label={FIELD_USERNAME.label}
                name={FIELD_USERNAME.name}
                className={styles.formItem}
                rules={[{ required: true, whitespace: true }]}
            >
                <Input type="text" placeholder={FIELD_USERNAME.label} />
            </Form.Item>
            <Form.Item
                label={FIELD_EMAIL.label}
                name={FIELD_EMAIL.name}
                className={styles.formItem}
                rules={[{ required: true, whitespace: true }]}
            >
                <Input type="email" placeholder={FIELD_EMAIL.label} />
            </Form.Item>

            <div className={styles.changePasswordLabel}>
                <p>Change Password</p>
                {!isUpdatingPassword ? (
                    <EditOutlined className={styles.icon} onClick={() => setIsUpdatingPassword(true)} />
                ) : (
                    <CloseOutlined className={styles.icon} onClick={handleCollapsePasswordFields} />
                )}
            </div>

            {isUpdatingPassword && (
                <div>
                    <Form.Item
                        label={FIELD_PASSWORD.label}
                        name={FIELD_PASSWORD.name}
                        className={styles.formItem}
                        rules={[{ required: true, whitespace: true }]}
                    >
                        <Input type="password" placeholder={FIELD_PASSWORD.label} autoComplete="on" />
                    </Form.Item>
                    <Form.Item
                        label={FIELD_CONFIRM_PASSWORD.label}
                        name={FIELD_CONFIRM_PASSWORD.name}
                        className={styles.formItem}
                        rules={[{ validator: passwordsMatchValidator }]}
                    >
                        <Input type="password" placeholder={FIELD_CONFIRM_PASSWORD.label} autoComplete="on" />
                    </Form.Item>
                </div>
            )}
            <div className={styles.buttonGroup}>
                <Button type="default" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </div>
        </Form>
    );
};
