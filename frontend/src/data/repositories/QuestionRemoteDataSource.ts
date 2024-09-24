import { BaseApi } from '../BaseApi';
import { Question } from '../../domain/entities/Question';

const API_URL = '/api/questions';

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

export class QuestionRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async getAllQuestions(): Promise<Question[]> {
        return this.get<Question[]>('/');
    }

    async getQuestion(id: string): Promise<Question> {
        return this.get<Question>(`/${id}`);
    }

    async createQuestion(question: IQuestionInput): Promise<void> {
        await this.post<void>('/', question);
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void> {
        await this.put<void>(`/${id}`, questionUpdate);
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.delete<void>(`/${id}`);
    }
}

export const questionRemoteDataSource = new QuestionRemoteDataSource();