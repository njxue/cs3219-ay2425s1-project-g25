import React, { useEffect, useState } from "react";
import { Modal, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./MatchingModal.module.css";

interface MatchingModalProps {
    visible: boolean;
    onClose: () => void;
    isMatching: boolean;
    matchFound?: boolean;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({ visible, onClose, isMatching, matchFound }) => {
    const navigate = useNavigate();
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;

        if (isMatching && !matchFound) {
            timer = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        }

        if (matchFound) {
            clearInterval(timer);
            const redirectTimeout = setTimeout(() => {
                onClose();
                navigate("/questions");
            }, 3000);

            return () => clearTimeout(redirectTimeout);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isMatching, matchFound, navigate, onClose]);

    useEffect(() => {
        if (!visible) {
            setElapsedTime(0);
        }
    }, [visible]);

    const handleCancelFinding = () => {
        setElapsedTime(0);
        onClose();
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            className={styles.matchingModal}
            width={800}
            style={{ mask: "rgba(0, 0, 0, 0.8)" }}
        >
            <div className={styles.modalContent}>
                {isMatching && !matchFound ? (
                    <div className={styles.matchingSection}>
                        <Spin size="large" />
                        <p className={styles.matchingText}>Matching you with a peer...</p>
                        <p className={styles.elapsedTimeText}>
                            Time waiting: {elapsedTime >= 60 ? `${Math.floor(elapsedTime / 60)}m ` : ""}
                            {elapsedTime % 60}s
                        </p>
                        <Button type="primary" danger onClick={handleCancelFinding} className={styles.cancelButton}>
                            Cancel Finding
                        </Button>
                    </div>
                ) : matchFound ? (
                    <div className={styles.matchFoundSection}>
                        <h2>Match Found!</h2>
                        <p>You are now matched with a peer! Redirecting in 3 seconds...</p>
                    </div>
                ) : (
                    <p>No match found yet.</p>
                )}
            </div>
        </Modal>
    );
};
