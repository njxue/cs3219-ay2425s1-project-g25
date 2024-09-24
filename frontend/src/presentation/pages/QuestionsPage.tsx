import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Button, Spin, Alert } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { LandingComponent } from "../components/LandingComponent";
import { Question } from "../../domain/entities/Question";
import { QUESTIONS_PAGE_TEXT } from "presentation/utils/constants";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./QuestionsPage.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { AddQuestionButton } from "presentation/components/buttons/AddQuestionButton";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import hooks from react-router-dom

const QuestionsPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isQuestionLoading, setIsQuestionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams(); // Use this to handle query parameters
    const navigate = useNavigate(); // Use this for programmatic navigation

    const selectedQuestionId = searchParams.get('selected'); // Get the selected question ID from query parameters

    // Fetch questions on initial load
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

    // Fetch selected question when questionId changes
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

    // Handle selecting a question
    const handleSelectQuestion = (questionId: string) => {
        setError(null);
        if (selectedQuestionId === questionId) {
            // If the same question is selected again, remove it from the URL
            navigate(ROUTES.QUESTIONS);
        } else {
            // Set the selected question ID in the URL
            setSearchParams({ selected: questionId });
        }
    };

    const handleBreadcrumbClick = (item: string) => () => {
        if (item === ROUTES.QUESTIONS) {
            // Reset the selected question in the URL
            setSearchParams({});
        }
    };

    const handleAddQuestion = () => {
        console.log("Add Question button clicked");
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
                                <AddQuestionButton label={QUESTIONS_PAGE_TEXT.ADD_QUESTION} onClick={handleAddQuestion} />
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
        </div>
    );
};

export default QuestionsPage;
