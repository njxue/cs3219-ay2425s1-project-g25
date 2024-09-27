import React, { useState, useCallback } from "react";
import { Select, Dropdown, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./QuestionFilters.module.css";
import { FILTER_DIFFICULTY_TEXT } from "presentation/utils/constants";
import { getDifficultyColor } from "presentation/utils/QuestionUtils";
import { CategoryFilter } from "./Category/CategoryFilter";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { SearchBar } from "./SearchBar";

interface QuestionFiltersProps {
    allCategories: string[];
    onFiltersChange: (filters: {
        selectedDifficulty: string;
        selectedCategories: string[];
        searchTerm: string;
    }) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    allCategories: initialCategories,
    onFiltersChange
}) => {
    const [allCategories, setAllCategories] = useState<string[]>(initialCategories);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(FILTER_DIFFICULTY_TEXT.ALL);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const triggerFiltersChange = useCallback(
        (filters: { selectedDifficulty: string; selectedCategories: string[]; searchTerm: string }) => {
            onFiltersChange?.(filters);
        },
        [onFiltersChange]
    );

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        triggerFiltersChange({
            selectedDifficulty,
            selectedCategories,
            searchTerm: term
        });
    };

    const handleDifficultyChange = (value: string) => {
        setSelectedDifficulty(value);
        triggerFiltersChange({
            selectedDifficulty: value,
            selectedCategories,
            searchTerm
        });
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const nextSelectedCategories = checked
            ? [...selectedCategories, category]
            : selectedCategories.filter((c) => c !== category);
        setSelectedCategories(nextSelectedCategories);
        triggerFiltersChange({
            selectedDifficulty,
            selectedCategories: nextSelectedCategories,
            searchTerm
        });
    };

    const handleAddCategory = async (category: string) => {
        if (!category || category.trim() === "") {
            message.error("Category cannot be empty!");
            return;
        }

        if (allCategories.includes(category)) {
            message.error("Category already exists!");
            return;
        }

        try {
            await categoryUseCases.createCategory(category);
            setAllCategories([...allCategories, category]);
            message.success("Category added successfully!");
        } catch (error) {
            message.error("Failed to add category!");
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (categoriesToDelete: string[]) => {
        try {
            await Promise.all(categoriesToDelete.map((category) => categoryUseCases.deleteCategory(category)));
            const updatedCategories = allCategories.filter((category) => !categoriesToDelete.includes(category));
            setAllCategories(updatedCategories);
            setSelectedCategories(selectedCategories.filter((c) => !categoriesToDelete.includes(c)));
            message.success("Categories deleted successfully!");
        } catch (error) {
            message.error("Failed to delete categories!");
            console.error("Failed to delete categories:", error);
        }
    };

    const dropdownContent = (
        <CategoryFilter
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
        />
    );

    return (
        <div className={styles.filtersContainer}>
            <div className={styles.filtersRow}>
                <div className={styles.filterItem}>
                    <Dropdown
                        trigger={["click"]}
                        placement="bottomLeft"
                        overlayClassName={styles.categoryDropdownOverlay}
                        dropdownRender={() => dropdownContent}
                    >
                        <Button className={styles.categoriesFilterButton}>
                            Categories <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>

                <div className={styles.filterItem}>
                    <Select
                        placeholder="Choose Difficulty"
                        value={
                            selectedDifficulty === FILTER_DIFFICULTY_TEXT.ALL ? "Choose Difficulty" : selectedDifficulty
                        }
                        onChange={handleDifficultyChange}
                        className={styles.difficultyFilter}
                        optionLabelProp="label"
                        options={[
                            {
                                value: FILTER_DIFFICULTY_TEXT.ALL,
                                label: <span>All</span>
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.EASY,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.EASY) }}>
                                        {FILTER_DIFFICULTY_TEXT.EASY}
                                    </span>
                                )
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.MEDIUM,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.MEDIUM) }}>
                                        {FILTER_DIFFICULTY_TEXT.MEDIUM}
                                    </span>
                                )
                            },
                            {
                                value: FILTER_DIFFICULTY_TEXT.HARD,
                                label: (
                                    <span style={{ color: getDifficultyColor(FILTER_DIFFICULTY_TEXT.HARD) }}>
                                        {FILTER_DIFFICULTY_TEXT.HARD}
                                    </span>
                                )
                            }
                        ]}
                    />
                </div>
            </div>

            <div className={styles.searchBarContainer}>
                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
            </div>
        </div>
    );
};
