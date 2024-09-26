import { Category } from '@shared/types/Category';  // Assuming Category type exists

export interface Question {
    _id: string,
    code: number,
    title: string,
    description: string,
    difficulty: string,
    categories: Category[],
    url: string
}