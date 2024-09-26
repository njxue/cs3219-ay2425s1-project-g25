import React, { useState } from "react";
import { Card, Tag, Divider, Modal } from "antd";
import { Question } from "../../domain/entities/Question";
import { getDifficultyColor } from "../utils/QuestionUtils";
import styles from "./QuestionDetail.module.css";
import MDEditor from "@uiw/react-md-editor";
import { EditQuestionForm } from "./EditQuestionForm/EditQuestionForm";

interface QuestionDetailProps {
    question: Question;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    return (
        <div className={styles.cardWrapper}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.titleContainer}>
                        <div className={styles.titleAndLink}>
                            <h2>{question.title}</h2>
                            {question.url && (
                                <a
                                    href={question?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="/icons/external-link.svg"
                                        width={24}
                                    />
                                </a>
                            )}
                        </div>

                        <img
                            src="/icons/pencil.svg"
                            width={24}
                            onClick={() => setIsEditModalOpen(true)}
                        />
                    </div>
                </div>
                <Divider className={styles.divider} />
                <div className={styles.content}>
                    <MDEditor.Markdown source={question.description} />
                    <div className={styles.metaContainer}>
                        <div className={styles.difficultyContainer}>
                            <span className={styles.metaLabel}>
                                Difficulty:
                            </span>
                            <Tag
                                color={getDifficultyColor(question.difficulty)}
                                className={styles.difficultyTag}
                            >
                                {question.difficulty}
                            </Tag>
                        </div>
                        <div className={styles.categoriesContainer}>
                            <span className={styles.metaLabel}>
                                Categories:
                            </span>
                            {question.categories.map((category, idx) => (
                                <Tag
                                    key={idx}
                                    color="blue"
                                    className={styles.categoryTag}
                                >
                                    {category}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                title="Edit question"
                footer={null}
                width={"75vw"}
            >
                <EditQuestionForm
                    question={question}
                    onSubmit={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
