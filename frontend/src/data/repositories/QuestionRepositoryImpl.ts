import { IQuestionRepository, IQuestionInput, IQuestionUpdateInput } from '../../domain/repositories/iQuestionRepository';
import { Question } from '../../domain/entities/question';
import { questionRemoteDataSource } from './questionRemoteDataSource';
import { mockQuestionRemoteDataSource } from './mockQuestionRepository';

// Set this to true to use the mock API, false to use the real API
const USE_MOCK_API = true;

export class QuestionRepositoryImpl implements IQuestionRepository {
    private dataSource = USE_MOCK_API ? mockQuestionRemoteDataSource : questionRemoteDataSource;

    async getAllQuestions(): Promise<Question[]> {
        return this.dataSource.getAllQuestions();
    }

    async getQuestion(id: string): Promise<Question> {
        return this.dataSource.getQuestion(id);
    }

    async createQuestion(question: IQuestionInput): Promise<void> {
        await this.dataSource.createQuestion(question);
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void> {
        await this.dataSource.updateQuestion(id, questionUpdate);
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.dataSource.deleteQuestion(id);
    }
}

export const questionRepository = new QuestionRepositoryImpl();