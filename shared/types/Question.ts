export interface Question {
    _id: string,
    code: number,
    title: string,
    description: string,
    difficulty: string,
    categories: string[],
    url: string
}