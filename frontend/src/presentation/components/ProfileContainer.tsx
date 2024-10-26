import styles from "./ProfileContainer.module.css";
import React, { useState } from "react";
import SampleProfilePicture from "../../assets/images/sample-profile-picture.jpg";
import { EditOutlined } from "@ant-design/icons";
import { useAuth } from "domain/context/AuthContext";
import { Button, Modal } from "antd";
import { UpdateProfileForm } from "./UpdateProfileForm/UpdateProfileForm";
import { Link } from "react-router-dom";
import { DeleteUserForm } from "./DeleteUserForm/DeleteUserForm";

export const ProfileContainer: React.FC = () => {
    const { user, isUserAdmin } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

    if (!user) {
        return <p>loading...</p>;
    }

    return (
        <>
            <div className={styles.container}>
                <img className={styles.profilePicture} src={SampleProfilePicture} />
                <div className={styles.profileDetailsContainer}>
                    <div className={styles.nameRow}>
                        <h2 className={styles.name}>{user?.username}</h2>
                        <EditOutlined className={styles.editIcon} onClick={() => setIsEditingProfile(true)} />
                    </div>
                    <div className={styles.emailAndDeactivate}>
                        <p className={styles.email}> {user?.email}</p>
                        <p onClick={() => setIsDeletingAccount(true)} className={styles.deactivate}>
                            Deactivate account
                        </p>
                    </div>

                    <div className={styles.linksContainer}>
                        {isUserAdmin && <Link to="/question-management">Manage questions</Link>}
                        {isUserAdmin && <Link to="/user-management">Manage users</Link>}
                    </div>
                </div>
            </div>
            <Modal open={isEditingProfile} closable={false} title="Update profile" footer={null} maskClosable={false}>
                <UpdateProfileForm
                    user={user}
                    onSubmit={() => setIsEditingProfile(false)}
                    onCancel={() => setIsEditingProfile(false)}
                />
            </Modal>
            <Modal
                open={isDeletingAccount}
                closable={false}
                title="Deactivate account"
                footer={null}
                maskClosable={false}
            >
                <DeleteUserForm
                    user={user}
                    onSubmit={() => setIsDeletingAccount(false)}
                    onCancel={() => setIsDeletingAccount(false)}
                />
            </Modal>
        </>
    );
};
