import { categoryRepository } from "data/repositories/CategoryRepositoryImpl";
import { ICategoryRepository } from "domain/repositories/ICategoryRepository";

export class CategoryUseCases {
	constructor(private categoryRepository: ICategoryRepository) {}

	async getAllCategories(): Promise<string[]> {
		return this.categoryRepository.getAllCategories();
	}

	async createCategory(category: string): Promise<void> {
		if (!category || category.trim() === "") {
			throw new Error("Category cannot be empty");
		}
		await this.categoryRepository.createCategory(category);
	}

	async deleteCategory(category: string): Promise<void> {
		if (!category) {
			throw new Error("Category not found");
		}
		await this.categoryRepository.deleteCategory(category);
	}

	async getCategoryStats(): Promise<{ total: number }> {
		const allCategories = await this.getAllCategories();
		return { total: allCategories.length };
	}
}

export const categoryUseCases = new CategoryUseCases(categoryRepository);
