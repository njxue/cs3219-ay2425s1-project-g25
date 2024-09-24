import React, { useState, useMemo, useCallback } from 'react';
import { Select, Input, Tag, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './QuestionFilters.module.css';

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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
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
          placeholder="Search Categories"
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
            placeholder="Select Difficulty"
            value={selectedDifficulty}
            onChange={handleDifficultyChange}
            className={styles.difficultyFilter}
            optionLabelProp="label"
            options={[{
                value: "All",
                label: <span>{"All"}</span>
              },{
                value: "Easy",
                label: <span style={{ color: 'green' }}>Easy</span>
              },{
                value: "Medium",
                label: <span style={{ color: 'goldenrod' }}>Medium</span>
              },{
                value: "Hard",
                label: <span style={{ color: 'red' }}>Hard</span>
              }
            ]}
          />
        </div>
      </div>

      <div className={styles.searchBarContainer}>
        <Input.Search
          placeholder="Search by title"
          value={searchTerm}
          onChange={handleSearch}
          className={styles.searchBar}
          allowClear
        />
      </div>
    </div>
  );
};
