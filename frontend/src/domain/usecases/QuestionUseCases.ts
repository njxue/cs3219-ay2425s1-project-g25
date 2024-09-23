import { Question } from '../entities/Question';
import { questionRepository } from '../../data/repositories/QuestionRepositoryImpl';
import { NotFoundError } from '../../presentation/utils/errors';
import { IQuestionRepository, IQuestionInput, IQuestionUpdateInput } from 'domain/repositories/IQuestionRepository';
import { QuestionValidator } from 'domain/validation/QuestionValidator';

export class QuestionUseCases {
    constructor(private questionRepository: IQuestionRepository) { }

    async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.getAllQuestions();
    }

    async getQuestion(id: string): Promise<Question> {
        const question = await this.questionRepository.getQuestion(id);
        if (!question) {
            throw new NotFoundError('Question not found');
        }
        return question;
    }

    async createQuestion(questionInput: IQuestionInput): Promise<void> {
        QuestionValidator.validateQuestionInput(questionInput);
        await this.questionRepository.createQuestion(questionInput);
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void> {
        QuestionValidator.validateQuestionUpdate(questionUpdate);
        await this.questionRepository.updateQuestion(id, questionUpdate);
    }

    async deleteQuestion(id: string): Promise<void> {
        const question = await this.getQuestion(id);
        await this.questionRepository.deleteQuestion(question.questionId);
    }

    async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter((question) => question.difficulty === difficulty);
    }

    async getQuestionsByCategory(category: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter((question) => question.categories.includes(category));
    }

    async searchQuestions(searchTerm: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter((question) =>
            question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.categories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    async getQuestionStats(): Promise<{ total: number; byDifficulty: Record<string, number>; byCategory: Record<string, number> }> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        const stats = {
            total: allQuestions.length,
            byDifficulty: {} as Record<string, number>,
            byCategory: {} as Record<string, number>,
        };

        allQuestions.forEach((question) => {
            stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;

            question.categories.forEach((category) => {
                stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
            });
        });

        return stats;
    }
}

export const questionUseCases = new QuestionUseCases(questionRepository);
