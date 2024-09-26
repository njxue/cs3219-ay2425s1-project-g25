export class MockCategoryRemoteDataSource {
    private categories: string[] = [
        "Strings",
        "Algorithms",
        "Data Structures",
        "Recursion",
        "Bit Manipulation",
        "Databases",
        "Arrays",
        "Brainteaser"
    ];

    async getAllCategories(): Promise<string[]> {
        return new Promise(resolve => {
            setTimeout(() => resolve([...this.categories]), 300);
        });
    }

    async createCategory(category: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.categories.includes(category)) {
                    reject(new Error('Category already exists'));
                } else {
                    this.categories.push(category);
                    resolve();
                }
            }, 300);
        });
    }

    async deleteCategory(category: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.categories.indexOf(category);
                if (index !== -1) {
                    this.categories.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error('Category not found'));
                }
            }, 300);
        });
    }
}

export const mockCategoryRemoteDataSource = new MockCategoryRemoteDataSource();
