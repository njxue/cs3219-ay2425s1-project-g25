import { Input, Form, Select, Row, Col, Button } from "antd";
import {
    categoryOptions,
    difficultyOptions,
    initialQuestionInput,
} from "presentation/utils/QuestionUtils";
import MdEditor from "@uiw/react-md-editor";
import styles from "./NewQuestionForm.module.css";
import { IQuestionInput } from "domain/repositories/IQuestionRepository";
import { questionRepository } from "data/repositories/QuestionRepositoryImpl";

interface NewQuestionFormProps {
    onSubmit?: () => void;
}
export const NewQuestionForm: React.FC<NewQuestionFormProps> = ({
    onSubmit,
}) => {
    const [form] = Form.useForm();
    const validateMessages = {
        required: "${label} is required",
        whitespace: "${label} is required",
    };

    async function handleSubmit(question: IQuestionInput) {
        const res = await questionRepository.createQuestion(question);
        onSubmit?.();
        // TODO: when BE completed
    }

    return (
        <div className={styles.questionForm}>
            <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialQuestionInput}
                validateMessages={validateMessages}
                scrollToFirstError
            >
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, whitespace: true }]}
                            labelAlign="right"
                        >
                            <Input placeholder="Title" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label="Difficulty"
                            name="difficulty"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                placeholder="Difficulty"
                                options={difficultyOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={18}>
                        <Form.Item
                            label="Categories"
                            name="categories"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                placeholder="Categories"
                                allowClear
                                mode="multiple"
                                options={categoryOptions}
                            ></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item label="Reference URL" name="url">
                            <Input type="text" placeholder="Reference URL" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, whitespace: true }]}
                        >
                            <MdEditor
                                value={form.getFieldValue("description") || ""}
                                onChange={(description) =>
                                    form.setFieldValue(
                                        "description",
                                        description
                                    )
                                }
                                overflow={false}
                                height={500}
                                enableScroll
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit">
                    Create
                </Button>
            </Form>
        </div>
    );
};
