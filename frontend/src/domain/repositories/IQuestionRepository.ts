import { Question } from '../entities/question';

export interface IQuestionInput {
    title: string;
    description: string;
    categories: string[];
    url: string;
}

export interface IQuestionUpdateInput {
    title?: string;
    description?: string;
    categories?: string[];
    url?: string;
}

export interface IQuestionRepository {
    getAllQuestions(): Promise<Question[]>;
    getQuestion(id: string): Promise<Question>;
    createQuestion(question: IQuestionInput): Promise<void>;
    updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void>;
    deleteQuestion(id: string): Promise<void>;
}