import questionModel from "../models/Question";
import { Request, Response } from "express";

export async function getAllQuestions(request: Request, response: Response) {

}

export async function createQuestion(request: Request, response: Response) {
    const { questionId, title, description, difficulty, categories, url } = request.body;

    try {
        const existingQuestion = await questionModel.findOne({ questionId });
        if (existingQuestion) {
            return response.status(400).json({
                message: "A question with the given questionId already exists."
            });
        }

        const newQuestion = new questionModel({
            questionId,
            title,
            description,
            difficulty,
            categories,
            url
        });

        await newQuestion.save();

        response.status(200).json({
            message: `New question ${questionId}: ${title} created.`
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating the question:", error.message);
            response.status(400).json({
                message: `Failed to create the question: ${error.message}`
            });
        } else {
            console.error("Error creating the question:", error);
            response.status(400).json({
                message: "Failed to create the question."
            });
        }
    }
}

export async function updateQuestion(request: Request, response: Response) {
    
}

export async function deleteQuestion(request: Request, response: Response) {
    
}

export async function getQuestion(request: Request, response: Response) {
    
}