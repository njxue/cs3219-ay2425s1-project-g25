import React, { useState, useMemo, useCallback } from 'react';
import { Select, Input, Tag, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './QuestionFilters.module.css';
import { FILTER_DIFFICULTY_TEXT, QUESTIONS_FILTER_TEXT } from 'presentation/utils/constants';
import { getDifficultyColor } from 'presentation/utils/QuestionUtils';

const { CheckableTag } = Tag;

interface QuestionFiltersProps {
    allCategories: string[];
    onFiltersChange: (filters: {
        selectedDifficulty: string;
        selectedCategories: string[];
        searchTerm: string;
    }) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    allCategories,
    onFiltersChange,
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(FILTER_DIFFICULTY_TEXT.ALL);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const triggerFiltersChange = useCallback(
        (filters: {
            selectedDifficulty: string;
            selectedCategories: string[];
            searchTerm: string;
        }) => {
            onFiltersChange?.(filters);
        },
        [onFiltersChange]
    );

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchTerm(value);
            triggerFiltersChange({
                selectedDifficulty,
                selectedCategories,
                searchTerm: value,
            });
        },
        [selectedDifficulty, selectedCategories, triggerFiltersChange]
    );

    const handleDifficultyChange = useCallback(
        (value: string) => {
            setSelectedDifficulty(value);
            triggerFiltersChange({
                selectedDifficulty: value,
                selectedCategories,
                searchTerm,
            });
        },
        [selectedCategories, searchTerm, triggerFiltersChange]
    );

    const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearchTerm(e.target.value);
    };

    const handleCategoryTagChange = useCallback(
        (category: string, checked: boolean) => {
            const nextSelectedCategories = checked
                ? [...selectedCategories, category]
                : selectedCategories?.filter((c) => c !== category);
            setSelectedCategories(nextSelectedCategories);
            triggerFiltersChange({
                selectedDifficulty,
                selectedCategories: nextSelectedCategories,
                searchTerm,
            });
        },
        [selectedDifficulty, selectedCategories, searchTerm, triggerFiltersChange]
    );

    const filteredCategories = useMemo(() => {
        const lowerSearchTerm = categorySearchTerm.toLowerCase();
        return allCategories.filter((category) =>
            category.toLowerCase().includes(lowerSearchTerm)
        );
    }, [allCategories, categorySearchTerm]);

    const categoryDropdownContent = (
        <div
            className={styles.categoryDropdownContent}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.categoryDropdownContainer}>
                <Input
                    placeholder={QUESTIONS_FILTER_TEXT.SELECT_CATEGORIES}
                    value={categorySearchTerm}
                    onChange={handleCategorySearch}
                    className={styles.categorySearchBar}
                    allowClear
                />
                <div className={styles.categoriesGrid}>
                    {filteredCategories.map((category) => (
                        <CheckableTag
                            key={category}
                            checked={selectedCategories.includes(category)}
                            onChange={(checked) => handleCategoryTagChange(category, checked)}
                        >
                            {category}
                        </CheckableTag>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersRow}>
                <div className={styles.filterItem}>
                    <Dropdown
                        overlay={categoryDropdownContent}
                        trigger={['click']}
                        overlayClassName={styles.categoryDropdownOverlay}
                    >
                        <Button className={styles.categoriesFilterButton}>
                            Categories <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>

                <div className={styles.filterItem}>
                    <Select
                        placeholder="Choose Difficulty"
                        value={selectedDifficulty === FILTER_DIFFICULTY_TEXT.ALL ? 'Choose Difficulty' : selectedDifficulty}
                        onChange={handleDifficultyChange}
                        className={styles.difficultyFilter}
                        optionLabelProp="label"
                        options={[{
                            value: FILTER_DIFFICULTY_TEXT.ALL,
                            label: <span>All</span>
                        },{
                            value: FILTER_DIFFICULTY_TEXT.EASY,
                            label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.EASY) }}>{FILTER_DIFFICULTY_TEXT.EASY}</span>
                        },{
                            value: FILTER_DIFFICULTY_TEXT.MEDIUM,
                            label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.MEDIUM) }}>{FILTER_DIFFICULTY_TEXT.MEDIUM}</span>
                        },{
                            value: FILTER_DIFFICULTY_TEXT.HARD,
                            label: <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.HARD) }}>{FILTER_DIFFICULTY_TEXT.HARD}</span>
                        }]}
                    />
                </div>
            </div>

            <div className={styles.searchBarContainer}>
                <Input.Search
                    placeholder={QUESTIONS_FILTER_TEXT.SELECT_TITLE}
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchBar}
                    allowClear
                />
            </div>
        </div>
    );
};
