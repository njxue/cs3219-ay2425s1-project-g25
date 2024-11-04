import React, { useState } from "react";
import { Button, Modal } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import styles from "./CodeActionButtons.module.css";
import { historyUseCases } from "domain/usecases/HistoryUseCases";

interface SubmitButtonProps {
    getEditorText: () => string;
    questionId: string;
    roomId: string;
    attemptStartedAt: Date;
    collaboratorId: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
    getEditorText,
    questionId,
    roomId,
    attemptStartedAt,
    collaboratorId,
}) => {
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
                icon={<CloudUploadOutlined />}
                className={styles.submitButton}
            >
                Submit
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

export default SubmitButton;
