export interface HistoryEntry {
    _id: string;
    key: string;
    roomId: string;
    attemptStartedAt: string;
    lastAttemptSubmittedAt: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topics: string[];
    attemptCodes: string[];
}