import React, { useState, useEffect } from "react";
import { List, Spin, Alert } from "antd";
import { Question } from "../../domain/entities/Question";
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
	const [filteredQuestions, setFilteredQuestions] =
		useState<Question[]>(questions);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({
		difficulty: "",
		category: "",
		status: "",
	});

	useEffect(() => {
		const filtered = questions.filter((question) => {
			const matchesSearch =
				question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				question.description.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesDifficulty =
				filters.difficulty === "" || question.difficulty === filters.difficulty;
			const matchesCategory =
				filters.category === "" ||
				question.categories.includes(filters.category);
			const matchesStatus =
				filters.status === "" || question.status === filters.status;

			return (
				matchesSearch && matchesDifficulty && matchesCategory && matchesStatus
			);
		});
		setFilteredQuestions(filtered);
	}, [questions, searchTerm, filters]);

	const handleSearch = (term: string) => {
		setSearchTerm(term);
	};

	const handleFilterChange = (newFilters: typeof filters) => {
		setFilters(newFilters);
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
				<SearchBar onSearch={handleSearch} />
			</div>
			<List
				className={styles.list}
				itemLayout="vertical"
				dataSource={filteredQuestions}
				renderItem={(question) => (
					<QuestionCard
						key={question.id}
						question={question}
						isSelected={selectedQuestion?.id === question.id}
						onClick={() => onSelectQuestion(question.id)}
						isNarrow={isNarrow}
					/>
				)}
			/>
		</div>
	);
};
