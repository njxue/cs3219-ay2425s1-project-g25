export class QuestionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QuestionError";
    }
}

export const handleError = (error: unknown, customMessage?: string): string => {
    if (error instanceof QuestionError) {
        return error.message;
    }
    console.error(error);
    return customMessage || "An unexpected error occurred. Please try again.";
};