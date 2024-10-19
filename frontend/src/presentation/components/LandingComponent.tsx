import React from "react";
import { Card } from "antd";
import styles from "./LandingComponent.module.css";
import { AddQuestionButton } from "./buttons/AddQuestionButton";
import { LANDING_CARD_TEXT } from "presentation/utils/constants";

interface LandingComponentProps {
    onAddQuestion?: () => void;
    isAdmin: boolean;
}

export const LandingComponent: React.FC<LandingComponentProps> = ({ onAddQuestion, isAdmin }) => (
    <div className={styles.cardWrapper}>
        <Card className={styles.card}>
            <div className={styles.content}>
                <h2>{isAdmin ? LANDING_CARD_TEXT.ADMIN_WELCOME : LANDING_CARD_TEXT.PEER_WELCOME}</h2>
                <p>{isAdmin ? LANDING_CARD_TEXT.ADMIN_INSTRUCTIONS : LANDING_CARD_TEXT.PEER_INSTRUCTIONS}</p>

                {isAdmin && onAddQuestion && (
                    <AddQuestionButton label={LANDING_CARD_TEXT.ADD_QUESTION} onClick={onAddQuestion} />
                )}
            </div>
        </Card>
    </div>
);
