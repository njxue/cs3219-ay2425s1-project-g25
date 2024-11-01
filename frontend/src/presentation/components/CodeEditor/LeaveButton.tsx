import React, { useState } from "react";
import { Button, Modal } from "antd";
import { StopOutlined } from "@ant-design/icons";
import styles from "./LeaveButton.module.css";
import AuthClientStore from "data/auth/AuthClientStore";
import { useNavigate } from "react-router-dom";

interface LeaveButtonProps {
    getEditorText: () => string;
    questionId: string;
    roomId: string;
    attemptStartedAt: Date;
    collaboratorId: string;
}

const LeaveButton: React.FC<LeaveButtonProps> = ({
    getEditorText,
    questionId,
    roomId,
    attemptStartedAt,
    collaboratorId,
}) => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editorContent, setEditorContent] = useState("");

    const showModal = () => {
        const content = getEditorText();
        setEditorContent(content);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        const token = AuthClientStore.getAccessToken();
        await fetch('http://localhost:3002/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionId,
            roomId,
            attemptStartedAt,
            attemptCompletedAt: new Date(),
            collaboratorId,
            attemptCode: getEditorText(),
          })
        });
        navigate('/')
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <Button
                onClick={showModal}
                type="text"
                icon={<StopOutlined />}
                className={styles.endButton}
            >
                End
            </Button>
            <Modal
                title="Editor Content"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="ok" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                <pre className={styles.modalContent}>{editorContent}</pre>
            </Modal>
        </>
    );
};

export default LeaveButton;
