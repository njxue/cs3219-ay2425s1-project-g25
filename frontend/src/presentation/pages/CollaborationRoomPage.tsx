import React, { useState } from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "presentation/components/QuestionDetail";
import { initialQuestions } from "data/repositories/mockQuestionRepository";
import { useParams } from "react-router-dom";
import { useAuth } from "domain/context/AuthContext";
import { useResizable } from "react-resizable-layout";

const CollaborationRoomPage: React.FC = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const { position, separatorProps } = useResizable({ axis: "x", min: 300, initial: 600, max: 800 });

    if (!roomId || !user?._id) {
        return <></>;
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.questionContainer}`} style={{ width: position }}>
                <QuestionDetail question={initialQuestions[0]} />
            </div>
            <div className={styles.verticalSeparator} {...separatorProps} />;
            <div className={`${styles.editorContainer}`}>
                <CodeEditor roomId={roomId} />
            </div>
        </div>
    );
};

export default CollaborationRoomPage;
