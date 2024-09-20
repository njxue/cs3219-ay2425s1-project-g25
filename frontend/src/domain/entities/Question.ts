export interface Question {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    categories: string[];
    status: 'complete' | 'working' | 'starting';
    link: string;
}