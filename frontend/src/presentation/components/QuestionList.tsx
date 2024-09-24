import React, { useState, useMemo, useCallback } from 'react';
import { List, Spin, Alert } from 'antd';
import { Question } from '../../domain/entities/Question';
import { QuestionCard } from './QuestionCard';
import { QuestionFilters } from './QuestionFilters';
import styles from './QuestionList.module.css';
import { QUESTIONS_LIST_TEXT } from 'presentation/utils/constants';

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
    error,
}) => {
    const [filters, setFilters] = useState({
        selectedDifficulty: 'All',
        selectedCategories: [] as string[],
        searchTerm: '',
    });

    //TODO: Change this into something less hacky. It currently just 'XORs' all question categories to get
    //a complete list. Ideally, there should just be a list of categories in the backend to query.
    const allCategories = useMemo(() => {
        const categoriesSet = new Set<string>();
        questions.forEach((question) => {
            question.categories.forEach((category) => categoriesSet.add(category));
        });
        return Array.from(categoriesSet);
    }, [questions]);

    const handleFiltersChange = (newFilters: React.SetStateAction<{ 
        selectedDifficulty: string; 
        selectedCategories: string[]; 
        searchTerm: string; 
    }>) => {
        setFilters(newFilters);
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            if (
                filters.selectedDifficulty !== 'All' &&
                question.difficulty !== filters.selectedDifficulty
            ) {
                return false;
            }
            if (
                filters.searchTerm &&
                !question.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
            ) {
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

    const renderItem = useCallback(
        (question: Question) => (
            <QuestionCard
                key={question.questionId}
                question={question}
                isSelected={selectedQuestionId === question.questionId}
                onClick={() => onSelectQuestion(question.questionId)}
                isNarrow={isNarrow}
            />
        ),
        [selectedQuestionId, onSelectQuestion, isNarrow]
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
            <QuestionFilters
                allCategories={allCategories}
                onFiltersChange={handleFiltersChange}
            />
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
