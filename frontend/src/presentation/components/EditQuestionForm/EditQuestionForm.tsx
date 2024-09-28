import React, { useState, useEffect } from "react";
import { Input, Form, Select, Row, Col, Button, Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import MdEditor from "@uiw/react-md-editor";
import styles from "../NewQuestionForm/NewQuestionForm.module.css";
import { Question } from "domain/entities/Question";
import { IQuestionUpdateInput } from "domain/repositories/IQuestionRepository";
import { QUESTION_FORM_FIELDS } from "presentation/utils/constants";
import { categoryUseCases } from "domain/usecases/CategoryUseCases";
import { toast } from "react-toastify";
import { Category } from "domain/entities/Category";
import { questionUseCases } from "domain/usecases/QuestionUseCases";
import { difficultyOptions } from "presentation/utils/QuestionUtils";

interface EditQuestionFormProps {
    question: Question;
    onSubmit?: (updatedQuestion: Question) => void;
}

export const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ question, onSubmit }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    const validateMessages = {
        required: "${label} is required",
        whitespace: "${label} is required"
    };

    const { code: _, categories: questionCategories, ...questionUpdateInput } = question;

    // Transform question categories to an array of their _id values
    const initialCategoryIds = questionCategories.map((cat) => cat._id);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const fetchedCategories: Category[] = await categoryUseCases.getAllCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                const message = (error as Error).message || "Failed to fetch categories";
                setCategoriesError(message);
                toast.error(message);
                console.error("Failed to fetch categories:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const { FIELD_TITLE, FIELD_DIFFICULTY, FIELD_DESCRIPTION, FIELD_CATEGORIES, FIELD_URL } = QUESTION_FORM_FIELDS;

    async function handleSubmit(questionUpdate: IQuestionUpdateInput) {
        try {
            // Get the selected category IDs from the form
            const selectedCategoryIds = form.getFieldValue("categories");

            // Map the selected category IDs back to their names
            const selectedCategoryNames = categories
                .filter((category) => selectedCategoryIds.includes(category._id))
                .map((category) => category.name);

            const updatedQuestion = {
                ...questionUpdate,
                categories: selectedCategoryNames // Send category names instead of _id
            };

            const data = await questionUseCases.updateQuestion(question._id, updatedQuestion);
            toast.success(data?.message || "Question updated successfully!");
            onSubmit?.(data?.updatedQuestion);
        } catch (err) {
            const message = (err as Error).message || "Failed to update question!";
            console.error("Error updating question:", err);
            toast.error(message);
        }
    }

    // Map categories to Select options
    const categoryOptions = categories.map((category) => ({
        label: category.name,
        value: category._id
    }));

    return (
        <div className={styles.questionForm}>
            {isLoadingCategories ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : categoriesError ? (
                <Alert message="Error" description={categoriesError} type="error" showIcon />
            ) : (
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        ...questionUpdateInput,
                        categories: initialCategoryIds // Pre-fill categories
                    }}
                    validateMessages={validateMessages}
                    scrollToFirstError
                    form={form}
                >
                    <Row gutter={16}>
                        <Col span={20}>
                            <Form.Item
                                label={FIELD_TITLE.label}
                                name={FIELD_TITLE.name}
                                rules={[{ required: true, whitespace: true }]}
                                labelAlign="right"
                            >
                                <Input placeholder={FIELD_TITLE.label} />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item
                                label={FIELD_DIFFICULTY.label}
                                name={FIELD_DIFFICULTY.name}
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <Select placeholder={FIELD_DIFFICULTY.label} options={difficultyOptions} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                label={FIELD_CATEGORIES.label}
                                name={FIELD_CATEGORIES.name}
                                rules={[
                                    {
                                        required: true
                                    }
                                ]}
                            >
                                <Select
                                    placeholder={FIELD_CATEGORIES.label}
                                    allowClear
                                    mode="multiple"
                                    options={categoryOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={FIELD_URL.label} name={FIELD_URL.name}>
                                <Input type="text" placeholder={FIELD_URL.label} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label={FIELD_DESCRIPTION.label}
                                name={FIELD_DESCRIPTION.name}
                                rules={[{ required: true, whitespace: true }]}
                            >
                                <MdEditor
                                    value={form.getFieldValue(FIELD_DESCRIPTION.name) || ""}
                                    onChange={(description) =>
                                        form.setFieldValue(FIELD_DESCRIPTION.name, description || "")
                                    }
                                    overflow={false}
                                    enableScroll
                                    height={300}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </Form>
            )}
        </div>
    );
};
