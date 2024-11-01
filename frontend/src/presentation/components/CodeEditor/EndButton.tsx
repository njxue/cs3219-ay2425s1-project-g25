import React, { useState } from "react";
import { Button, Modal } from "antd";
import { StopOutlined } from "@ant-design/icons";
import styles from "./EndButton.module.css";

interface EndButtonProps {
    getEditorText: () => string;
}

const EndButton: React.FC<EndButtonProps> = ({ getEditorText }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editorContent, setEditorContent] = useState("");

    const showModal = () => {
        const content = getEditorText();
        setEditorContent(content);
        setIsModalVisible(true);
    };

    const handleOk = () => {
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

export default EndButton;
