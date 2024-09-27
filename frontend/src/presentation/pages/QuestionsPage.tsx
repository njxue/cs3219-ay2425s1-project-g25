import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Breadcrumb, Button, Spin, Alert, Modal } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { LandingComponent } from "../components/LandingComponent";
import { NewQuestionForm } from "../components/NewQuestionForm/NewQuestionForm";
import { Question } from "../../domain/entities/Question";
import { QUESTIONS_PAGE_TEXT } from "presentation/utils/constants";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./QuestionsPage.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { AddQuestionButton } from "presentation/components/buttons/AddQuestionButton";
import { useSearchParams } from "react-router-dom";

const QuestionsPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const selectedQuestionId: string | null = searchParams.get("code");
    const selectedQuestion: Question | undefined = questions.find(
        (question) => question.questionId === selectedQuestionId
    );

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const fetchedQuestions = await questionUseCases.getAllQuestions();
                setQuestions(fetchedQuestions);
            } catch (err) {
                setError(handleError(err, ERRORS.FAILED_TO_LOAD_QUESTIONS));
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const handleSelectQuestion = (questionId: string) => {
        setError(null);
        if (selectedQuestionId === questionId) {
            setSearchParams({});
        } else {
            setSearchParams({ code: questionId });
        }
    };

    const handleBreadcrumbClick = (item: string) => () => {
        if (item === ROUTES.QUESTIONS) {
            setSearchParams({});
        }
    };

    const handleAddQuestion = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const onCreateQuestion = (createdQuestion: Question) => {
        handleCloseModal();
        setQuestions((questions) => [...questions, createdQuestion]);
        setSearchParams({ code: createdQuestion.questionId });
    };

    // TODO: fix this
    const onEditQuestion = (updatedQuestion: Question) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q.questionId === updatedQuestion.questionId ? { ...updatedQuestion } : q))
        );
        setSearchParams({ code: updatedQuestion.questionId });
    };

    const renderBreadcrumb = () => {
        const breadcrumbItems = [
            {
                title: (
                    <Button type="link" onClick={handleBreadcrumbClick(ROUTES.QUESTIONS)}>
                        {ROUTES.QUESTIONS}
                    </Button>
                )
            }
        ];

        if (selectedQuestion) {
            breadcrumbItems.push({
                title: (
                    <Button type="link" disabled>
                        {selectedQuestion.title}
                    </Button>
                )
            });
        }

        return (
            <div className={styles.breadcrumb}>
                <Breadcrumb items={breadcrumbItems} />
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {renderBreadcrumb()}
            <div className={styles.scrollContainer}>
                <Row className={styles.contentRow} gutter={32}>
                    <Col span={8} className={styles.transitionCol}>
                        <QuestionList
                            isNarrow={selectedQuestionId !== null}
                            questions={questions}
                            selectedQuestionId={selectedQuestionId || null}
                            onSelectQuestion={handleSelectQuestion}
                            isLoading={isLoading}
                            error={error}
                        />
                        {selectedQuestionId && (
                            <div className={styles.addButtonWrapper}>
                                <AddQuestionButton
                                    label={QUESTIONS_PAGE_TEXT.ADD_QUESTION}
                                    onClick={handleAddQuestion}
                                />
                            </div>
                        )}
                    </Col>
                    <Col span={16} className={styles.transitionCol}>
                        {selectedQuestion ? (
                            <QuestionDetail question={selectedQuestion} onEdit={onEditQuestion} />
                        ) : (
                            <LandingComponent onAddQuestion={handleAddQuestion} />
                        )}
                    </Col>
                </Row>
            </div>

            <Modal
                title="Add New Question"
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={"90vw"}
                centered
            >
                <NewQuestionForm onSubmit={onCreateQuestion} />
            </Modal>
        </div>
    );
};

export default QuestionsPage;
