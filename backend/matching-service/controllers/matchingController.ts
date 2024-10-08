import { Request, Response, NextFunction } from "express";
import matchingRequestModel from "../models/MatchingRequest";

export async function getMatch(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const { username, email, category, difficulty } = request.body;

        const newRequest = new matchingRequestModel({
            username,
            email,
            category,
            difficulty,
        });

        await newRequest.save();

        return response.status(200).json({
            message: `Match found for ${username} with email ${email} in category ${category} with difficulty ${difficulty}.`,
        });
    } catch (error) {
        next(error);
    }
}
