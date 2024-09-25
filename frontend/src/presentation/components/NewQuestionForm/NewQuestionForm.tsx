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
import { QUESTION_FORM_FIELDS } from "presentation/utils/constants";

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

    const {
        FIELD_TITLE,
        FIELD_DIFFICULTY,
        FIELD_DESCRIPTION,
        FIELD_CATEGORIES,
        FIELD_URL,
    } = QUESTION_FORM_FIELDS;

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
                            label={FIELD_TITLE.label}
                            name={FIELD_TITLE.name}
                            rules={[{ required: true, whitespace: true }]}
                            labelAlign="right"
                        >
                            <Input placeholder={FIELD_TITLE.label} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label={FIELD_DIFFICULTY.label}
                            name={FIELD_DIFFICULTY.name}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                placeholder={FIELD_DIFFICULTY.label}
                                options={difficultyOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={18}>
                        <Form.Item
                            label={FIELD_CATEGORIES.label}
                            name={FIELD_CATEGORIES.name}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                placeholder={FIELD_CATEGORIES.label}
                                allowClear
                                mode="multiple"
                                options={categoryOptions}
                            ></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label={FIELD_URL.label}
                            name={FIELD_URL.name}
                        >
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
                                value={
                                    form.getFieldValue(
                                        FIELD_DESCRIPTION.name
                                    ) || ""
                                }
                                onChange={(description) =>
                                    form.setFieldValue(
                                        FIELD_DESCRIPTION.name,
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
