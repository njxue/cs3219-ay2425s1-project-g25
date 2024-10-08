import { Request, Response, NextFunction } from "express";

export async function getMatch(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const { username, email, category, difficulty } = request.body;
        return response.status(200).json({
            message: `Match found for ${username} with email ${email} in category ${category} with difficulty ${difficulty}.`,
        });
    } catch (error) {
        next(error);
    }
}
