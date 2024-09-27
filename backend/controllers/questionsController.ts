import questionModel from "../models/Question";
import categoryModel from "../models/Category";
import { Request, Response, NextFunction } from "express";

export async function getAllQuestions(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const questions = await questionModel.find().populate("categories"); // Populate categories
        response.status(200).json(questions);
    } catch (error) {
        next(error);
    }
}

export async function createQuestion(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { title, description, difficulty, categories, url } = req.body;

    try {
        const existingQuestion = await questionModel.findOne({ title });
        if (existingQuestion) {
            return res.status(400).json({
                message: "A question with the given title already exists.",
            });
        }

        // Find or create categories based on names
        const categoryIds = await Promise.all(
            categories.map(async (categoryName: string) => {
                let category = await categoryModel.findOne({
                    name: categoryName,
                });
                if (!category) {
                    category = new categoryModel({ name: categoryName });
                    await category.save();
                }
                return category._id;
            })
        );

        const largestQuestion = await questionModel
            .findOne()
            .sort({ code: -1 });
        const code = largestQuestion ? largestQuestion.code + 1 : 1;

        const newQuestion = new questionModel({
            code,
            title,
            description,
            difficulty,
            categories: categoryIds,
        });
        if (url) newQuestion.url = url; // Add url only if it's provided

        await newQuestion.save();

        res.status(201).json({
            message: `New question ${code}: ${title} created.`,
            question: newQuestion,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;
    let { categories, ...updateData } = request.body;

    try {
        if (categories) {
            // If categories are being updated, map names to ObjectId references
            const categoryIds = await Promise.all(
                categories.map(async (categoryName: string) => {
                    let category = await categoryModel.findOne({
                        name: categoryName,
                    });
                    if (!category) {
                        category = new categoryModel({ name: categoryName });
                        await category.save();
                    }
                    return category._id;
                })
            );
            updateData = { ...updateData, categories: categoryIds }; // Update categories with ObjectId references
        }

        const updatedQuestion = await questionModel
            .findOneAndUpdate(
                { _id: id },
                { $set: updateData },
                { new: true, runValidators: true } // return the updated document and apply validation
            )
            .populate("categories"); // Populate categories in the response

        if (!updatedQuestion) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        response.status(200).json({
            message: `Question ${id} updated successfully.`,
            updatedQuestion,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;

    try {
        const deletedQuestion = await questionModel.findOneAndDelete({ _id: id });

        if (!deletedQuestion) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        response.status(200).json({
            message: `Question ${id} deleted successfully.`,
        });
    } catch (error) {
        next(error);
    }
}

export async function getQuestion(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { id } = request.params;

    try {
        const question = await questionModel.findOne({ _id: id });
        if (!question) {
            return response.status(404).json({
                message: `Question with _id ${id} not found.`,
            });
        }

        response.status(200).json(question);
    } catch (error) {
        next(error);
    }
}
