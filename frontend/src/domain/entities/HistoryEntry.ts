export interface HistoryEntry {
    _id: string;
    key: string;
    attemptStartedAt: string;
    attemptCompletedAt: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    attemptCode: string;
}