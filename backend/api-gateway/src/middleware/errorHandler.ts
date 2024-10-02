import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message}`);
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
};

export { AppError, errorHandler };
