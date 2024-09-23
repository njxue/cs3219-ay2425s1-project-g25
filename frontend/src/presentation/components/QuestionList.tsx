import React, { useState } from "react";
import { List, Spin, Alert } from "antd";
import { Question } from "../../domain/entities/question";
import { QuestionCard } from "./QuestionCard";
import styles from "./QuestionList.module.css";
import { SearchBar } from "./SearchBar";

interface QuestionListProps {
	questions: Question[];
	selectedQuestion: Question | null;
	onSelectQuestion: (questionId: string) => void;
	isNarrow: boolean;
	isLoading: boolean;
	error: string | null;
}

export const QuestionList: React.FC<QuestionListProps> = ({
	questions,
	selectedQuestion,
	onSelectQuestion,
	isNarrow,
	isLoading,
	error,
}) => {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredQuestions = questions.filter((question) => {
		const matchesSearch =
			question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			question.description.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	if (isLoading) {
		return (
			<div className={styles.centerContent}>
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return <Alert message="Error" description={error} type="error" showIcon />;
	}

	if (questions.length === 0) {
		return (
			<Alert
				message="No Questions"
				description="There are no questions available at the moment."
				type="info"
				showIcon
			/>
		);
	}

	return (
		<div className={styles.questionListContainer}>
			<div className={styles.searchFilterBarContainer}>
				<SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
			</div>
			<List
				className={styles.list}
				itemLayout="vertical"
				dataSource={filteredQuestions}
				renderItem={(question) => (
					<QuestionCard
						key={question.questionId}
						question={question}
						isSelected={selectedQuestion?.questionId === question.questionId}
						onClick={() => onSelectQuestion(question.questionId)}
						isNarrow={isNarrow}
					/>
				)}
			/>
		</div>
	);
};
