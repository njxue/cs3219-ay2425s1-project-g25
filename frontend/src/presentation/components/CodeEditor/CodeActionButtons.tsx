import { Button } from "antd";
import { useCollaboration } from "domain/context/CollaborationContext";
import { PlayCircleOutlined, CloudUploadOutlined } from "@ant-design/icons";
import styles from "./CodeActionButtons.module.css";

interface CodeActionButtonsProps {
    disabled?: boolean;
}
export const CodeActionButtons: React.FC<CodeActionButtonsProps> = ({ disabled = false }) => {
    const { handleExecuteCode } = useCollaboration();
    return (
        <>
            <Button
                onClick={async () => {
                    await handleExecuteCode();
                }}
                className={styles.runButton}
                icon={<PlayCircleOutlined />}
                disabled={disabled}
            >
                Run
            </Button>
            <Button className={styles.submitButton} icon={<CloudUploadOutlined />} disabled={disabled}>
                Submit
            </Button>
        </>
    );
};
