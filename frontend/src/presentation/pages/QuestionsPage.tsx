import React, { useState, useEffect } from "react";
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
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const selectedQuestionId = searchParams.get('selected');

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

    useEffect(() => {
        const fetchSelectedQuestion = async () => {
            if (selectedQuestionId) {
                setIsQuestionLoading(true);
                try {
                    const question = await questionUseCases.getQuestion(selectedQuestionId);
                    setSelectedQuestion(question);
                } catch (err) {
                    setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
                    setSelectedQuestion(null);
                } finally {
                    setIsQuestionLoading(false);
                }
            } else {
                setSelectedQuestion(null);
            }
        };

        fetchSelectedQuestion();
    }, [selectedQuestionId]);

    const handleSelectQuestion = (questionId: string) => {
        setError(null);
        if (selectedQuestionId === questionId) {
            setSearchParams({});
        } else {
            setSearchParams({ selected: questionId });
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

    const renderBreadcrumb = () => (
        <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item>
                <Button type="link" onClick={handleBreadcrumbClick(ROUTES.QUESTIONS)}>
                    {ROUTES.QUESTIONS}
                </Button>
            </Breadcrumb.Item>
            {selectedQuestion && (
                <Breadcrumb.Item>
                    <Button type="link" disabled>
                        {selectedQuestion.title}
                    </Button>
                </Breadcrumb.Item>
            )}
        </Breadcrumb>
    );

    return (
        <div className={styles.container}>
            {renderBreadcrumb()}
            <div className={styles.scrollContainer}>
                <Row className={styles.contentRow} gutter={32}>
                    <Col
                        span={8}
                        className={styles.transitionCol}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
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
                    <Col
                        span={16}
                        className={styles.transitionCol}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {selectedQuestionId ? (
                            isQuestionLoading ? (
                                <div className={styles.centerContent}>
                                    <Spin size="large" />
                                </div>
                            ) : selectedQuestion ? (
                                <QuestionDetail question={selectedQuestion} />
                            ) : (
                                <div className={styles.centerContent}>
                                    <Alert
                                        message="Error"
                                        description={error}
                                        type="error"
                                        showIcon
                                    />
                                </div>
                            )
                        ) : (
                            <LandingComponent onAddQuestion={handleAddQuestion} />
                        )}
                    </Col>
                </Row>
            </div>

            <Modal
                title="Add New Question"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={1200} 
            >
                <NewQuestionForm />
            </Modal>
        </div>
    );
};

export default QuestionsPage;
