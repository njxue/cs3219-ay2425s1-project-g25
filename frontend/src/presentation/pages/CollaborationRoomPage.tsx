import React from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "presentation/components/QuestionDetail";
import { initialQuestions } from "data/repositories/mockQuestionRepository";
import { useParams } from "react-router-dom";
import { useResizable } from "react-resizable-layout";
import NotFound from "./NotFound";
import { OutputBox } from "presentation/components/CodeEditor/OutputBox";

const CollaborationRoomPage: React.FC = () => {
    const { roomId } = useParams();

    const { position: questionPosition, separatorProps: verticalSeparatorProps } = useResizable({
        axis: "x",
        min: 300,
        initial: 600,
        max: 800
    });

    const { position: outputPosition, separatorProps: horizontalSeparatorProps } = useResizable({
        axis: "y",
        min: 60,
        initial: 60,
        max: 500,
        reverse: true
    });

    if (!roomId) {
        return <NotFound />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.questionContainer} style={{ width: questionPosition }}>
                <QuestionDetail question={initialQuestions[0]} />
            </div>
            <div className={styles.verticalSeparator} {...verticalSeparatorProps} />
            <div className={styles.editorAndOutputContainer}>
                <div className={styles.editorContainer}>
                    <CodeEditor roomId={roomId} />
                </div>
                <div className={styles.horizontalSeparator} {...horizontalSeparatorProps} />
                <div className={styles.outputContainer} style={{ height: outputPosition }}>
                    <OutputBox />
                </div>
            </div>
        </div>
    );
};

export default CollaborationRoomPage;
