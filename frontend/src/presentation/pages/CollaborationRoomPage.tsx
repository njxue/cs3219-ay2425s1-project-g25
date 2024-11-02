import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "presentation/components/QuestionDetail";
import { useParams } from "react-router-dom";
import { useResizable } from "react-resizable-layout";
import NotFound from "./NotFound";
import { OutputBox } from "presentation/components/CodeEditor/OutputBox";
import ToggleButton from "presentation/components/buttons/ToggleButton";
import ChatFrame from "presentation/components/iframe/ChatFrame";
import { questionUseCases } from "domain/usecases/QuestionUseCases";
import { Question } from "domain/entities/Question";
import { toast } from "react-toastify";

const CollaborationRoomPage: React.FC = () => {
    const { roomId, questionId } = useParams();
    const [showChat, setShowChat] = useState(false);
    const [question, setQuestion] = useState<Question | null>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout>();

    const handleResize = useCallback(() => {
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(() => {
            console.log("Resizing...");
        }, 100);
    }, []);

    useEffect(() => {
        if (!questionId) {
            return;
        }
        const fetchQuestion = async () => {
            try {
                const question = await questionUseCases.getQuestion(questionId);
                setQuestion(question);
            } catch (err) {
                console.error(err);
                // Strict mode runs effects twice. Toastid prevents duplicate toasts (alternatively, can check if mounted)
                toast.error("Unable to fetch question", { toastId: "questionError" });
            }
        };

        fetchQuestion();
    }, [questionId]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) handleResize();
        });

        const container = document.querySelector(`.${styles.container}`);
        if (container) resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        };
    }, [handleResize]);

    const { position: questionPosition, separatorProps: verticalSeparatorProps } = useResizable({
        axis: "x",
        min: 300,
        initial: window.innerWidth * 0.3,
        max: window.innerWidth * 0.6
    });

    const { position: outputPosition, separatorProps: horizontalSeparatorProps } = useResizable({
        axis: "y",
        min: 60,
        initial: window.innerHeight * 0.2,
        max: window.innerHeight * 0.6,
        reverse: true
    });

    if (!roomId) return <NotFound />;

    return (
        <div className={styles.container}>
            <div className={styles.questionContainer} style={{ width: questionPosition }}>
                <div className={styles.questionContent}>
                    <ToggleButton showChat={showChat} onClick={() => setShowChat(!showChat)} />
                    {showChat ? (
                        <ChatFrame roomId={roomId} />
                    ) : question ? (
                        <QuestionDetail question={question} />
                    ) : (
                        <p>Loading question...</p>
                    )}
                </div>
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
