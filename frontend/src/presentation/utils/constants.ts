import { QuestionDifficulty } from "domain/entities/QuestionDifficulty";

export const ROUTES = {
    QUESTIONS: "Questions",
};

export const MESSAGES = {
    WORKING_AREA_TITLE: 'Working Area',
    WORKING_AREA_DESCRIPTION: "This is where you'll work on the selected question.",
};

export const HASH = {
    SEPARATOR: "/",
};

export const ERRORS = {
    QUESTION_TITLE_EMPTY: 'Question title cannot be empty',
    QUESTION_DESCRIPTION_EMPTY: 'Question description cannot be empty',
    QUESTION_CATEGORY_EMPTY: 'Question must have at least one category',
    QUESTION_NOT_FOUND: 'Question not found',
    FAILED_TO_LOAD_QUESTIONS: 'Failed to load questions. Please try again later.',
    FAILED_TO_LOAD_SELECTED_QUESTION: 'Failed to load the selected question.',
    FAILED_TO_CREATE_QUESTION: 'Failed to create the question. Please try again later.',
    FAILED_TO_UPDATE_QUESTION: 'Failed to update the question. Please try again later.',
    FAILED_TO_DELETE_QUESTION: 'Failed to delete the question. Please try again later.',
    GENERAL_ERROR: 'An unexpected error occurred. Please try again later.'
};

export const QUESTIONS_PAGE_TEXT = {
    LAST_SELECTED_QUESTION_KEY: "lastSelectedQuestionId",
    ADD_QUESTION: "Add a new question"
}

export const QUESTIONS_LIST_TEXT = {
    NO_QUESTIONS: "No Questions",
    NO_QUESTIONS_DESCRIPTION: "No questions match your filters."
}

export const QUESTIONS_FILTER_TEXT = {
    SELECT_DIFFICULTY: "Select Difficulty",
    SELECT_CATEGORIES: "Select Categories",
    SELECT_TITLE: "Search by title",
}

export const FILTER_DIFFICULTY_TEXT = {
    ALL: "All",
    EASY: "Easy" as QuestionDifficulty,
    MEDIUM: "Medium" as QuestionDifficulty,
    HARD: "Hard" as QuestionDifficulty
}

export const LANDING_CARD_TEXT = {
    WELCOME: "Welcome to the Question Workspace",
    INSTRUCTIONS: "Select a question from the list or add a new question to get started.",
    ADD_QUESTION: "Add a new question"
}