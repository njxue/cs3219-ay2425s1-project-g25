// QuestionFilters.tsx
import React, { useState, useCallback } from "react";
import { Dropdown, Button, Select, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./QuestionFilters.module.css";
import { FILTER_DIFFICULTY_TEXT } from "presentation/utils/constants";
import { getDifficultyColor } from "presentation/utils/QuestionUtils";
import { CategoryFilter } from "./Category/CategoryFilter";
import { Category } from "domain/entities/Category";
import { SearchBar } from "./SearchBar";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";

interface QuestionFiltersProps {
    allCategories: Category[];
    onFiltersChange: (filters: {
        selectedDifficulty: string;
        selectedCategories: string[];
        searchTerm: string;
    }) => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
    allCategories,
    onFiltersChange
}) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(FILTER_DIFFICULTY_TEXT.ALL);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleFiltersChange = useCallback(
        (filters: {
            selectedDifficulty: string;
            selectedCategories: string[];
            searchTerm: string;
        }) => {
            onFiltersChange(filters);
        },
        [onFiltersChange]
    );

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        handleFiltersChange({
            selectedDifficulty,
            selectedCategories,
            searchTerm: term
        });
    };

    const handleDifficultyChange = (value: string) => {
        setSelectedDifficulty(value);
        handleFiltersChange({
            selectedDifficulty: value,
            selectedCategories,
            searchTerm
        });
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        const nextSelectedCategories = checked
            ? [...selectedCategories, categoryId]
            : selectedCategories.filter((c) => c !== categoryId);
        setSelectedCategories(nextSelectedCategories);
        handleFiltersChange({
            selectedDifficulty,
            selectedCategories: nextSelectedCategories,
            searchTerm
        });
    };

    const handleAddCategory = async (categoryName: string) => {
        if (!categoryName || categoryName.trim() === "") {
            message.error("Category cannot be empty!");
            return;
        }

        const exists = allCategories.some(
            (category) => category.name.toLowerCase() === categoryName.toLowerCase()
        );

        if (exists) {
            message.error("Category already exists!");
            return;
        }

        try {
            const newCategory: Category = await categoryUseCases.createCategory(categoryName);
            // setAllCategories([...allCategories, newCategory]);
            message.success("Category added successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to add category!");
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (categoriesToDeleteIds: string[]) => {
        try {
            await Promise.all(categoriesToDeleteIds.map((categoryId) => categoryUseCases.deleteCategory(categoryId)));
            const updatedCategories = allCategories.filter((category) => !categoriesToDeleteIds.includes(category._id));
            // setAllCategories(updatedCategories);
            setSelectedCategories(selectedCategories.filter((c) => !categoriesToDeleteIds.includes(c)));
            message.success("Categories deleted successfully!");
        } catch (error) {
            message.error((error as Error).message || "Failed to delete categories!");
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
                        allowClear
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
