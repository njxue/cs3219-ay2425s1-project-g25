export interface ICategoryRepository {
	getAllCategories(): Promise<string[]>;
	createCategory(category: string): Promise<void>;
	deleteCategory(category: string): Promise<void>;
}
