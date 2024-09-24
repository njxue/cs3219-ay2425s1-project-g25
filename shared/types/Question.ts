export interface Question {
    _id: string,
    questionId: number,
    title: string,
    description: string,
    difficulty: string,
    categories: string[],
    url: string
}