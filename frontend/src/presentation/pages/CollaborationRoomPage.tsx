import React, { useState } from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "presentation/components/QuestionDetail";
import { initialQuestions } from "data/repositories/mockQuestionRepository";
import { useParams } from "react-router-dom";
import { useAuth } from "domain/context/AuthContext";

const CollaborationRoomPage: React.FC = () => {
    const { roomId } = useParams();
    const { user } = useAuth();

    if (!roomId || !user?._id) {
        return <></>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.questionContainer}>
                <QuestionDetail question={initialQuestions[0]} />
            </div>
            <div className={styles.editorContainer}>
                <CodeEditor roomId={roomId} />
            </div>
        </div>
    );
};

export default CollaborationRoomPage;
