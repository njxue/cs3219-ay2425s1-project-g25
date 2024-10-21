import React, { useState } from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "presentation/components/QuestionDetail";
import { initialQuestions } from "data/repositories/mockQuestionRepository";

const CollaborationRoomPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.questionContainer}>
                <QuestionDetail question={initialQuestions[0]} />
            </div>
            <div className={styles.editorContainer}>
                <CodeEditor />
            </div>
        </div>
    );
};

export default CollaborationRoomPage;
