import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined, CrownFilled, CrownOutlined } from "@ant-design/icons";
import styles from "./UserManagement..module.css";
import { Modal } from "antd";
import { UpdateProfileForm } from "presentation/components/UpdateProfileForm/UpdateProfileForm";
import { DeleteUserForm } from "presentation/components/DeleteUserForm/DeleteUserForm";
import { UpdateUserPrivilegeForm } from "presentation/components/UpdateUserPrivilegeForm/UpdateUserPrivilegeForm";


export const UserManagement: React.FC<{}> = () => {
    const [users, setUsers] = useState<User[]>([]);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [promotingUser, setPromotingUser] = useState<User | null>(null);

    useEffect(() => {
        const getAllUsers = async () => {
            const users = await userUseCases.getAllUsers();
            setUsers(users);
        };
        getAllUsers();
    }, []);

    const sortedUsers = users.sort((u1, u2) => {
        if (u1.isAdmin && !u2.isAdmin) {
            return -1;
        } else if (!u1.isAdmin && u2.isAdmin) {
            return 1;
        } else {
            return u1.username.localeCompare(u2.username);
        }
    });

    const renderUser = (user: User) => {
        return (
            <div className={styles.userRow} key={user._id}>
                <div className={styles.username}>
                    <p>{user.username}</p>
                    {user.isAdmin && <CrownFilled />}
                </div>

                {!user.isAdmin && (
                    <div className={styles.userControls}>
                        <DeleteOutlined onClick={() => setDeletingUser(user)} />
                        <CrownOutlined
                            onClick={() => {
                                setPromotingUser(user);
                            }}
                        />
                        <EditOutlined onClick={() => setEditingUser(user)} />
                    </div>
                )}
            </div>
        );
    };

    const onEditUser = (updatedUser: User) => {
        refreshUsersList(updatedUser);
        setEditingUser(null);
    };

    const onDeleteUser = (userId: string) => {
        setUsers((users) => users.filter((user) => user._id !== userId));
        setDeletingUser(null);
    };

    const onPromoteUser = (updatedUser: User) => {
        refreshUsersList(updatedUser);
        setPromotingUser(null);
    };

    const refreshUsersList = (updatedUser: User) => {
        const updatedUsers = users.map((user) => {
            if (user._id === updatedUser._id) {
                return updatedUser;
            }
            return user;
        });
        setUsers(updatedUsers);
    };

    return (
        <div className={styles.container}>
            {sortedUsers.map((user) => renderUser(user))}
            {editingUser && (
                <Modal
                    open={editingUser !== null}
                    closable={false}
                    title="Edit user"
                    footer={null}
                    maskClosable={false}
                >
                    <UpdateProfileForm user={editingUser} onSubmit={onEditUser} onCancel={() => setEditingUser(null)} />
                </Modal>
            )}
            {deletingUser && (
                <Modal
                    open={deletingUser !== null}
                    closable={false}
                    title="Delete user"
                    footer={null}
                    maskClosable={false}
                >
                    <DeleteUserForm
                        user={deletingUser}
                        onCancel={() => setDeletingUser(null)}
                        onSubmit={() => onDeleteUser(deletingUser?._id)}
                    />
                </Modal>
            )}
            {promotingUser && (
                <Modal
                    open={promotingUser !== null}
                    closable={false}
                    title="Promote user"
                    footer={null}
                    maskClosable={false}
                >
                    <UpdateUserPrivilegeForm
                        user={promotingUser}
                        onSubmit={onPromoteUser}
                        onCancel={() => setPromotingUser(null)}
                    />
                </Modal>
            )}
        </div>
    );
};
