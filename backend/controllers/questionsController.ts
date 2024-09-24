import questionModel from "../models/Question";
import { Request, Response } from "express";

export async function getAllQuestions(request: Request, response: Response) {

}

export async function createQuestion(request: Request, response: Response) {
    const { title, description, difficulty, categories, url } = request.body;

    try {
        const existingQuestion = await questionModel.findOne({ title });
        if (existingQuestion) {
            return response.status(400).json({
                message: "A question with the given code already exists."
            });
        }

        // Get counting code:
        // Find the largest code in the collection
        const largestQuestion = await questionModel.findOne().sort({ code: -1 });
        const code = largestQuestion ? largestQuestion.code + 1 : 1;

        const newQuestion = new questionModel({
            code,
            title,
            description,
            difficulty,
            categories,
            url
        });

        await newQuestion.save();

        response.status(200).json({
            message: `New question ${code}: ${title} created.`
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