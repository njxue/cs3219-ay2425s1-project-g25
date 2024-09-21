export interface Question {
    _id: string,
    title: string,
    description: string,
    difficulty: string,
    categories: string[],
    url: string
}