import questionModel from "../models/Question";
import { Request, Response } from "express";

export async function getAllQuestions(request: Request, response: Response) {
    try {
        const questions = await questionModel.find();
        response.status(200).json(questions);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching questions:", error.message);
            response.status(400).json({
                message: `Failed to fetch questions: ${error.message}`
            });
        } else {
            console.error("Error fetching questions:", error);
            response.status(400).json({
                message: "Failed to fetch questions."
            });
        }
    }
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
    const { code } = request.params;
    const updateData = request.body;

    try {
        const updatedQuestion = await questionModel.findOneAndUpdate(
            { code },
            { $set: updateData },
            { new: true, runValidators: true } // return the updated document and apply validation
        );

        if (!updatedQuestion) {
            return response.status(404).json({
                message: `Question with code ${code} not found.`
            });
        }

        response.status(200).json({
            message: `Question ${code} updated successfully.`,
            updatedQuestion
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating the question:", error.message);
            response.status(400).json({
                message: `Failed to update the question: ${error.message}`
            });
        } else {
            console.error("Error updating the question:", error);
            response.status(400).json({
                message: "Failed to update the question."
            });
        }
    }
}


export async function deleteQuestion(request: Request, response: Response) {
    const { code } = request.params;

    try {
        const deletedQuestion = await questionModel.findOneAndDelete({ code });

        if (!deletedQuestion) {
            return response.status(404).json({
                message: `Question with code ${code} not found.`
            });
        }

        response.status(200).json({
            message: `Question ${code} deleted successfully.`
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting the question:", error.message);
            response.status(400).json({
                message: `Failed to delete the question: ${error.message}`
            });
        } else {
            console.error("Error deleting the question:", error);
            response.status(400).json({
                message: "Failed to delete the question."
            });
        }
    }
}


export async function getQuestion(request: Request, response: Response) {
    const { questionId } = request.params;

    try {
        const question = await questionModel.findOne({ questionId });
        if (!question) {
            return response.status(404).json({
                message: `Question with id ${questionId} not found.`
            });
        }

        response.status(200).json(question);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching the question:", error.message);
            response.status(400).json({
                message: `Failed to fetch the question: ${error.message}`
            });
        } else {
            console.error("Error fetching the question:", error);
            response.status(400).json({
                message: "Failed to fetch the question."
            });
        }
    }
}