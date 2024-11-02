import React, { useState } from "react";
import { Button, Modal } from "antd";
import { StopOutlined } from "@ant-design/icons";
import styles from "./LeaveButton.module.css";
import { useNavigate } from "react-router-dom";
import { historyUseCases } from "domain/usecases/HistoryUseCases";

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
        await historyUseCases.createOrUpdateUserHistory(
            questionId,
            roomId,
            attemptStartedAt.getTime().toString(),
            Date.now().toString(),
            collaboratorId,
            getEditorText(),
        );
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
                Leave
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
