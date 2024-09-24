import { QuestionDifficulty } from "./QuestionDifficulty";
export interface Question {
	questionId: string;
	title: string;
	description: string;
	difficulty: QuestionDifficulty;
	categories: string[];
	url: string;
}
