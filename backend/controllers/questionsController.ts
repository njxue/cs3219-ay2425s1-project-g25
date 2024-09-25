import questionModel from "../models/Question";
import { Request, Response, NextFunction } from "express";

export async function getAllQuestions(request: Request, response: Response, next: NextFunction) {
    try {
        const questions = await questionModel.find();
        response.status(200).json(questions);
    } catch (error) {
        next(error);
    }
}

export async function createQuestion(request: Request, response: Response, next: NextFunction) {
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
        next(error);
    }
}

export async function updateQuestion(request: Request, response: Response, next: NextFunction) {
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
        next(error);
    }
}


export async function deleteQuestion(request: Request, response: Response, next: NextFunction) {
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
        next(error);
    }
}


export async function getQuestion(request: Request, response: Response, next: NextFunction) {
    const { code } = request.params;

    try {
        const question = await questionModel.findOne({ code });
        if (!question) {
            return response.status(404).json({
                message: `Question with code ${code} not found.`
            });
        }

        response.status(200).json(question);
    } catch (error) {
        next(error);
    }
}