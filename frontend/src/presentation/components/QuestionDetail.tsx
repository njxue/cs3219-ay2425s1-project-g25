import React, { useState } from "react";
import { Tag, Divider, Modal, Button, Card } from "antd";
import { Question } from "../../domain/entities/Question";
import { getDifficultyColor } from "../utils/QuestionUtils";
import styles from "./QuestionDetail.module.css";
import MDEditor from "@uiw/react-md-editor";
import { EditQuestionForm } from "./EditQuestionForm/EditQuestionForm";
import { EditOutlined } from "@ant-design/icons";
import { ReactMarkdown } from "./common/ReactMarkdown";

interface QuestionDetailProps {
    question: Question;
    onEdit?: (updatedQuestion: Question) => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onEdit }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const onEditQuestion = (updatedQuestion: Question) => {
        setIsEditModalOpen(false);
        onEdit?.(updatedQuestion);
    };

    return (
        <>
            <Card className={styles.card}>
                <div className={styles.titleContainer}>
                    <div className={styles.titleAndLink}>
                        <h2>{question.title}</h2>
                        {question.url && (
                            <a
                                href={question.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="External Link"
                                className={styles.externalLink}
                            >
                                <img
                                    src="/icons/external-link.svg"
                                    alt="External Link"
                                    width={24}
                                    className={styles.icon}
                                />
                            </a>
                        )}
                    </div>

                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setIsEditModalOpen(true)}
                        aria-label="Edit Question"
                        className={styles.editButton}
                    />
                </div>

                <Divider className={styles.divider} />
                <div className={styles.content}>
                    <ReactMarkdown isReadOnly value={question.description} />
                    <div className={styles.metaContainer}>
                        <div className={styles.difficultyContainer}>
                            <span className={styles.metaLabel}>Difficulty:</span>
                            <Tag color={getDifficultyColor(question.difficulty)} className={styles.difficultyTag}>
                                {question.difficulty}
                            </Tag>
                        </div>
                        <div className={styles.categoriesContainer}>
                            <span className={styles.metaLabel}>Categories:</span>
                            {question.categories.map((category) => (
                                <Tag key={category._id} color="blue" className={styles.categoryTag}>
                                    {category.name}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                title="Edit Question"
                footer={null}
                width={"90vw"}
                centered
                destroyOnClose
                aria-labelledby="edit-question-modal"
            >
                <EditQuestionForm question={question} onSubmit={onEditQuestion} />
            </Modal>
        </>
    );
};
