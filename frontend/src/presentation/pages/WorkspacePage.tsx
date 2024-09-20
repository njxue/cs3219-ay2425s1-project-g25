import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Button } from "antd";
import { QuestionList } from "../components/QuestionList";
import { QuestionDetail } from "../components/QuestionDetail";
import { Question } from "../../domain/entities/Question";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import styles from "./WorkspacePage.module.css";

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
				setIsLoading(false);
			} catch (error) {
				console.error("Failed to fetch questions:", error);
				setError("Failed to load questions. Please try again later.");
				setIsLoading(false);
			}
		};

		fetchQuestions();
	}, []);

	useEffect(() => {
		const handleHashChange = async () => {
			const hash = window.location.hash.slice(1);
			const [questionId, state] = hash.split("/");

			if (questionId) {
				try {
					const question = await questionUseCases.getQuestion(questionId);
					setSelectedQuestion(question);
					setIsWorking(state === "working");
				} catch (error) {
					console.error("Failed to fetch question:", error);
					setError("Failed to load the selected question. Please try again.");
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

	const handleSelectQuestion = async (questionId: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const question = await questionUseCases.getQuestion(questionId);
			setSelectedQuestion(question);
			setIsWorking(false);
			window.location.hash = `#${question.id}`;
		} catch (error) {
			console.error("Failed to select question:", error);
			setError("Failed to load the selected question. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleStartQuestion = () => {
		setIsWorking(true);
		if (selectedQuestion) {
			window.location.hash = `#${selectedQuestion.id}/working`;
		}
	};

	const handleBreadcrumbClick = (item: string) => () => {
		switch (item) {
			case "Workspace":
				setSelectedQuestion(null);
				setIsWorking(false);
				window.location.hash = "";
				break;
			case selectedQuestion?.title:
				if (selectedQuestion) {
					setIsWorking(false);
					window.location.hash = `#${selectedQuestion.id}`;
				}
				break;
			default:
				break;
		}
	};

	const isNarrow = selectedQuestion !== null;

	const renderBreadcrumb = () => {
		return (
			<Breadcrumb className={styles.breadcrumb}>
				<Breadcrumb.Item>
					<Button type="link" onClick={handleBreadcrumbClick("Workspace")}>
						Workspace
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
				{isWorking && <Breadcrumb.Item>Working</Breadcrumb.Item>}
			</Breadcrumb>
		);
	};

	return (
		<div className={styles.container}>
			{renderBreadcrumb()}
			<h1 className={styles.heading}>Workspace</h1>
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
								{/* Add your working area components here */}
								<h2>Working Area</h2>
								<p>This is where you'll work on the selected question.</p>
							</div>
						</Col>
					)}
				</Row>
			</div>
		</div>
	);
};

export default WorkspacePage;
