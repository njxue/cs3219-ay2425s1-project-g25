// src/presentation/pages/WorkspacePage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Breadcrumb, Button } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { Question } from "../../domain/entities/Question";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./WorkspacePage.module.css";
import { HASH, ROUTES, ERRORS } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";

const WorkspacePage: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchQuestions = async () => {
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
		const handleHashChange = async () => {
			const hash = window.location.hash.slice(1);
			const questionId = hash.split(HASH.SEPARATOR)[0];

			if (questionId) {
				try {
					const question = await questionUseCases.getQuestion(questionId);
					setSelectedQuestion(question);
				} catch (err) {
					setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
					setSelectedQuestion(null);
				}
			} else {
				setSelectedQuestion(null);
			}
		};

		window.addEventListener("hashchange", handleHashChange);
		handleHashChange();
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	const handleSelectQuestion = useCallback(async (questionId: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const question = await questionUseCases.getQuestion(questionId);
			setSelectedQuestion(question);
			window.location.hash = `#${question.questionId}`;
		} catch (err) {
			setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleBreadcrumbClick = useCallback(
		(item: string) => () => {
			if (item === ROUTES.WORKSPACE) {
				setSelectedQuestion(null);
				window.location.hash = "";
			} else if (item === selectedQuestion?.title) {
				window.location.hash = `#${selectedQuestion.questionId}`;
			}
		},
		[selectedQuestion]
	);

	const isNarrow = selectedQuestion !== null;

	const renderBreadcrumb = () => (
		<Breadcrumb className={styles.breadcrumb}>
			<Breadcrumb.Item>
				<Button type="link" onClick={handleBreadcrumbClick(ROUTES.WORKSPACE)}>
					{ROUTES.WORKSPACE}
				</Button>
			</Breadcrumb.Item>
			{selectedQuestion && (
				<Breadcrumb.Item>
					<Button
						type="link"
						onClick={handleBreadcrumbClick(selectedQuestion.title)}
					>
						{selectedQuestion.title}
					</Button>
				</Breadcrumb.Item>
			)}
		</Breadcrumb>
	);

	return (
		<div className={styles.container}>
			{renderBreadcrumb()}
			<h1 className={styles.heading}>{ROUTES.WORKSPACE}</h1>
			<p className={styles.description}>
				This is your workspace. Below are the available questions.
			</p>

			<div className={styles.scrollContainer}>
				<Row
					className={`${styles.contentRow} ${
						selectedQuestion ? styles.withSelection : ""
					}`}
					gutter={32}
				>
					<Col
						span={selectedQuestion ? 8 : 24}
						className={styles.transitionCol}
					>
						<QuestionList
							isNarrow={isNarrow}
							questions={questions}
							selectedQuestion={selectedQuestion}
							onSelectQuestion={handleSelectQuestion}
							isLoading={isLoading}
							error={error}
						/>
					</Col>

					{selectedQuestion && (
						<Col span={16} className={styles.transitionCol}>
							<QuestionDetail question={selectedQuestion} />
						</Col>
					)}
				</Row>
			</div>
		</div>
	);
};

export default WorkspacePage;
