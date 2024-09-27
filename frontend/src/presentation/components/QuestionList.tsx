import React, { useState, useEffect, useMemo } from "react";
import { List, Spin, Alert } from "antd";
import { Question } from "../../domain/entities/Question";
import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";
import styles from "./QuestionList.module.css";
import { QUESTIONS_LIST_TEXT } from "presentation/utils/constants";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";

interface QuestionListProps {
    questions: Question[];
    selectedQuestionId: string | null;
    onSelectQuestion: (questionId: string) => void;
    isNarrow: boolean;
    isLoading: boolean;
    error: string | null;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    selectedQuestionId,
    onSelectQuestion,
    isNarrow,
    isLoading,
    error
}) => {
    const [filters, setFilters] = useState({
        selectedDifficulty: "All",
        selectedCategories: [] as string[],
        searchTerm: ""
    });

    const [allCategories, setAllCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryUseCases.getAllCategories();
                setAllCategories(categories);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };

        fetchCategories();
    }, []);

    const handleFiltersChange = (
        newFilters: React.SetStateAction<{
            selectedDifficulty: string;
            selectedCategories: string[];
            searchTerm: string;
        }>
    ) => {
        setFilters(newFilters);
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            if (filters.selectedDifficulty !== "All" && question.difficulty !== filters.selectedDifficulty) {
                return false;
            }
            if (filters.searchTerm && !question.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
                return false;
            }
            if (filters.selectedCategories.length > 0) {
                const hasCategory = filters.selectedCategories.every((category) =>
                    question.categories.includes(category)
                );
                if (!hasCategory) {
                    return false;
                }
            }
            return true;
        });
    }, [questions, filters]);

    const renderItem = (question: Question) => (
        <QuestionCard
            key={question.questionId}
            question={question}
            isSelected={selectedQuestionId === question.questionId}
            onClick={() => onSelectQuestion(question.questionId)}
            isNarrow={isNarrow}
        />
    );

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
    return (
        <div className={styles.questionListContainer}>
            <QuestionFilters allCategories={allCategories} onFiltersChange={handleFiltersChange} />
            <div className={styles.listContainer}>
                {filteredQuestions.length === 0 ? (
                    <Alert
                        message={QUESTIONS_LIST_TEXT.NO_QUESTIONS}
                        description={QUESTIONS_LIST_TEXT.NO_QUESTIONS_DESCRIPTION}
                        type="info"
                        showIcon
                    />
                ) : (
                    <List
                        className={styles.list}
                        itemLayout="vertical"
                        dataSource={filteredQuestions}
                        renderItem={renderItem}
                    />
                )}
            </div>
        </div>
    );
};
