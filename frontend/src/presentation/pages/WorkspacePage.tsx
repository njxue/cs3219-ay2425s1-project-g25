// src/presentation/pages/WorkspacePage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Breadcrumb, Button } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { Question } from "../../domain/entities/question";
import { questionUseCases } from "../../domain/usecases/questionUseCases";
import styles from "./WorkspacePage.module.css";
import { HASH, ROUTES, ERRORS, MESSAGES } from "presentation/utils/constants";
import { handleError } from "presentation/utils/errorHandler";

const WorkspacePage: React.FC = () => {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	);
	const [isWorking, setIsWorking] = useState(false);
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
			const [questionId, state] = hash.split(HASH.SEPARATOR);

			if (questionId) {
				try {
					const question = await questionUseCases.getQuestion(questionId);
					setSelectedQuestion(question);
					setIsWorking(state === ROUTES.WORKING);
				} catch (err) {
					setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
					setSelectedQuestion(null);
					setIsWorking(false);
				}
			} else {
				setSelectedQuestion(null);
				setIsWorking(false);
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
			setIsWorking(false);
			window.location.hash = `#${question.id}`;
		} catch (err) {
			setError(handleError(err, ERRORS.FAILED_TO_LOAD_SELECTED_QUESTION));
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleStartQuestion = useCallback(() => {
		setIsWorking(true);
		if (selectedQuestion) {
			window.location.hash = `#${selectedQuestion.id}${HASH.SEPARATOR}${ROUTES.WORKING}`;
		}
	}, [selectedQuestion]);

	const handleBreadcrumbClick = useCallback(
		(item: string) => () => {
			if (item === ROUTES.WORKSPACE) {
				setSelectedQuestion(null);
				setIsWorking(false);
				window.location.hash = "";
			} else if (item === selectedQuestion?.title) {
				setIsWorking(false);
				window.location.hash = `#${selectedQuestion.id}`;
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
			{isWorking && (
				<Breadcrumb.Item>
					{ROUTES.WORKING.charAt(0).toUpperCase() + ROUTES.WORKING.slice(1)}
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
						span={isWorking ? 8 : selectedQuestion ? 8 : 24}
						className={styles.transitionCol}
					>
						{!isWorking ? (
							<QuestionList
								isNarrow={isNarrow}
								questions={questions}
								selectedQuestion={selectedQuestion}
								onSelectQuestion={handleSelectQuestion}
								isLoading={isLoading}
								error={error}
							/>
						) : (
							selectedQuestion && (
								<QuestionDetail
									question={selectedQuestion}
									onStartQuestion={handleStartQuestion}
									isWorking={isWorking}
								/>
							)
						)}
					</Col>

					{selectedQuestion && !isWorking && (
						<Col span={16} className={styles.transitionCol}>
							<QuestionDetail
								question={selectedQuestion}
								onStartQuestion={handleStartQuestion}
								isWorking={isWorking}
							/>
						</Col>
					)}

					{isWorking && (
						<Col span={16} className={styles.transitionCol}>
							<div className={styles.workingArea}>
								<h2>{MESSAGES.WORKING_AREA_TITLE}</h2>
								<p>{MESSAGES.WORKING_AREA_DESCRIPTION}</p>
							</div>
						</Col>
					)}
				</Row>
			</div>
		</div>
	);
};

export default WorkspacePage;
