// CategoryFilter.tsx
import React, { useState, useMemo } from 'react';
import { Input, Tag, Button, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './CategoryFilter.module.css';

const { CheckableTag } = Tag;

interface CategoryFilterProps {
    allCategories: string[];
    selectedCategories: string[];
    onCategoryChange: (category: string, checked: boolean) => void;
    onAddCategory: (category: string) => void;
    onDeleteCategory: (categories: string[]) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    allCategories,
    selectedCategories,
    onCategoryChange,
    onAddCategory,
    onDeleteCategory,
}) => {
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [deletingMode, setDeletingMode] = useState(false);
    const [categoriesToDelete, setCategoriesToDelete] = useState<string[]>([]);

    const filteredCategories = useMemo(() => {
        const lowerSearchTerm = categorySearchTerm.toLowerCase();
        return allCategories.filter((category) =>
            category.toLowerCase().includes(lowerSearchTerm)
        );
    }, [allCategories, categorySearchTerm]);

    const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearchTerm(e.target.value);
    };

    const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory(e.target.value);
    };

    const handleAddCategoryClick = () => {
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const toggleDeleteMode = () => {
        setDeletingMode(!deletingMode);
        setCategoriesToDelete([]);
    };

    const handleCategoryToDeleteChange = (category: string, checked: boolean) => {
        const updatedCategories = checked
            ? [...categoriesToDelete, category]
            : categoriesToDelete.filter((c) => c !== category);
        setCategoriesToDelete(updatedCategories);
    };

    const confirmDeletion = () => {
        if (categoriesToDelete.length === 0) {
            Modal.info({
                title: 'No Categories Selected',
                content: 'Please select at least one category to delete.',
            });
            return;
        }

        Modal.confirm({
            title: 'Confirm Deletion',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete the selected ${categoriesToDelete.length} category(ies)?`,
            onOk: () => {
                onDeleteCategory(categoriesToDelete);
                setDeletingMode(false);
                setCategoriesToDelete([]);
            },
        });
    };

    return (
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
                        checked={
                            deletingMode
                                ? categoriesToDelete.includes(category)
                                : selectedCategories.includes(category)
                        }
                        onChange={(checked) =>
                            deletingMode
                                ? handleCategoryToDeleteChange(category, checked)
                                : onCategoryChange(category, checked)
                        }
                        className={styles.checkableTag}
                    >
                        {category}
                    </CheckableTag>
                ))}
            </div>

            <div className={styles.addCategoryContainer}>
                <Input
                    placeholder="New Category"
                    value={newCategory}
                    onChange={handleNewCategoryChange}
                    className={styles.newCategoryInput}
                    onPressEnter={handleAddCategoryClick}
                />
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={handleAddCategoryClick}
                    className={styles.addCategoryButton}
                >
                    Add
                </Button>
            </div>

            <div className={styles.deleteCategoryContainer}>
                <Button
                    icon={<DeleteOutlined />}
                    type="primary"
                    danger
                    onClick={toggleDeleteMode}
                    className={styles.toggleDeleteButton}
                >
                    {deletingMode ? 'Cancel Delete' : 'Delete Categories'}
                </Button>
                {deletingMode && (
                    <Button
                        type="default"
                        onClick={confirmDeletion}
                        disabled={categoriesToDelete.length === 0}
                        className={styles.confirmDeleteButton}
                    >
                        Confirm Deletion
                    </Button>
                )}
            </div>
        </div>
    );
};
