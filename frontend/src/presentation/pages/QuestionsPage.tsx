import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Breadcrumb, Button, Spin, Alert } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { LandingComponent } from "../components/LandingComponent";
import { Question } from "../../domain/entities/Question";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./QuestionsPage.module.css";
import { ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";
import { AddQuestionButton } from "presentation/components/buttons/AddQuestionButton";

const LAST_SELECTED_QUESTION_KEY = "lastSelectedQuestionId";

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    //Should we use slugs/query params instead of this?
    const lastSelectedQuestionId = localStorage.getItem(
      LAST_SELECTED_QUESTION_KEY
    );

    if (lastSelectedQuestionId) {
      setSelectedQuestionId(lastSelectedQuestionId);
    }
  }, []);

  useEffect(() => {
    const fetchSelectedQuestion = async () => {
      if (selectedQuestionId) {
        setIsQuestionLoading(true);
        try {
          const question = await questionUseCases.getQuestion(
            selectedQuestionId
          );
          setSelectedQuestion(question);
          localStorage.setItem(LAST_SELECTED_QUESTION_KEY, selectedQuestionId);
        } catch (err) {
          setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
          setSelectedQuestion(null);
          localStorage.removeItem(LAST_SELECTED_QUESTION_KEY);
        } finally {
          setIsQuestionLoading(false);
        }
      } else {
        setSelectedQuestion(null);
        localStorage.removeItem(LAST_SELECTED_QUESTION_KEY);
      }
    };

    fetchSelectedQuestion();
  }, [selectedQuestionId]);

  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      setError(null);
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(null);
      } else {
        setSelectedQuestionId(questionId);
      }
    },
    [selectedQuestionId]
  );

  const handleBreadcrumbClick = useCallback(
    (item: string) => () => {
      if (item === ROUTES.WORKSPACE) {
        setSelectedQuestionId(null);
      }
    },
    []
  );

  const handleAddQuestion = useCallback(() => {
    console.log("Add Question button clicked");
  }, []);

  const renderBreadcrumb = () => (
    <Breadcrumb className={styles.breadcrumb}>
      <Breadcrumb.Item>
        <Button type="link" onClick={handleBreadcrumbClick(ROUTES.WORKSPACE)}>
          {ROUTES.WORKSPACE}
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
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={handleSelectQuestion}
              isLoading={isLoading}
              error={error}
            />
            {selectedQuestionId && (
              <div className={styles.addButtonWrapper}>
                <AddQuestionButton label="Add a New Question" onClick={handleAddQuestion} />
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
