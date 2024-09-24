import React from "react";
import { Card } from "antd";
import styles from "./LandingComponent.module.css";
import { AddQuestionButton } from "./buttons/AddQuestionButton";

interface LandingComponentProps {
    onAddQuestion: () => void;
}

export const LandingComponent: React.FC<LandingComponentProps> = ({ onAddQuestion }) => (
    <div className={styles.cardWrapper}>
        <Card className={styles.card}>
            <div className={styles.content}>
                <h2>{"Welcome to the Question Workspace"}</h2>
                <p>{"Select a question from the list or add a new question to get started."}</p>
                <AddQuestionButton label="Add a New Question" onClick={onAddQuestion} />
            </div>
        </Card>
    </div>
);
