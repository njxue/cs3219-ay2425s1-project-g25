// src/domain/usecases/QuestionUseCases.ts

import { IQuestionRepository, IQuestionInput, IQuestionUpdateInput } from '../repositories/IQuestionRepository';
import { Question } from '../entities/Question';
import { questionRepository } from '../../data/repositories/QuestionRepositoryImpl';

export class QuestionUseCases {
    constructor(private questionRepository: IQuestionRepository) { }

    async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.getAllQuestions();
    }

    async getQuestion(id: string): Promise<Question> {
        return this.questionRepository.getQuestion(id);
    }

    async createQuestion(questionInput: IQuestionInput): Promise<void> {
        if (!questionInput.title || questionInput.title.trim() === '') {
            throw new Error('Question title cannot be empty');
        }
        if (!questionInput.description || questionInput.description.trim() === '') {
            throw new Error('Question description cannot be empty');
        }
        if (!questionInput.categories || questionInput.categories.length === 0) {
            throw new Error('Question must have at least one category');
        }
        await this.questionRepository.createQuestion(questionInput);
    }

    async updateQuestion(id: string, questionUpdate: IQuestionUpdateInput): Promise<void> {
        if (questionUpdate.title !== undefined && questionUpdate.title.trim() === '') {
            throw new Error('Question title cannot be empty');
        }
        if (questionUpdate.description !== undefined && questionUpdate.description.trim() === '') {
            throw new Error('Question description cannot be empty');
        }
        if (questionUpdate.categories !== undefined && questionUpdate.categories.length === 0) {
            throw new Error('Question must have at least one category');
        }
        await this.questionRepository.updateQuestion(id, questionUpdate);
    }

    async deleteQuestion(id: string): Promise<void> {
        const question = await this.questionRepository.getQuestion(id);
        if (!question) {
            throw new Error('Question not found');
        }
        await this.questionRepository.deleteQuestion(id);
    }

    async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter(question => question.difficulty === difficulty);
    }

    async getQuestionsByCategory(category: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter(question => question.categories.includes(category));
    }

    async searchQuestions(searchTerm: string): Promise<Question[]> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        return allQuestions.filter(question =>
            question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    async getQuestionStats(): Promise<{ total: number, byDifficulty: Record<string, number>, byCategory: Record<string, number> }> {
        const allQuestions = await this.questionRepository.getAllQuestions();
        const stats = {
            total: allQuestions.length,
            byDifficulty: {} as Record<string, number>,
            byCategory: {} as Record<string, number>
        };

        allQuestions.forEach(question => {
            // Count by difficulty
            stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;

            // Count by category
            question.categories.forEach(category => {
                stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
            });
        });

        return stats;
    }
}

// Create and export an instance of QuestionUseCases
export const questionUseCases = new QuestionUseCases(questionRepository);