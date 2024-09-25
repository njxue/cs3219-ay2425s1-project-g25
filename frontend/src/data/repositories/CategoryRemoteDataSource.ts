import { BaseApi } from '../BaseApi';

const API_URL = '/api/categories';

export class CategoryRemoteDataSource extends BaseApi {
    constructor() {
        super(API_URL);
    }

    async getAllCategories(): Promise<string[]> {
        return this.get<string[]>('/');
    }

    async createCategory(category: string): Promise<void> {
        await this.post<void>('/', { category });
    }

    async deleteCategory(category: string): Promise<void> {
        await this.delete<void>(`/${category}`);
    }
}

export const categoryRemoteDataSource = new CategoryRemoteDataSource();
