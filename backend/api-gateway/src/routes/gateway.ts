import express, { Request, Response, NextFunction } from 'express';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import http from 'http';

const router = express.Router();

// Base URL for the microservices (since both auth and users are on the same port)
const baseServiceUrl = "http://localhost:3001";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Forward login request to Auth Service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Forward verify token request to Auth Service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */



router.all('/*', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const servicePath = req.path.split('/')[1];
    logger.info(`Incoming request - Path: ${req.path}, Method: ${req.method}, Service Path: ${servicePath}`);

    if (servicePath !== 'auth' && servicePath !== 'users') {
        logger.warn(`Service not found for path: ${servicePath}`);
        return next(new AppError('Service not found', 404));
    }

    const serviceUrl = `${baseServiceUrl}${req.originalUrl}`;
    logger.info(`Attempting to forward request to: ${serviceUrl}`);
    logger.info(`Request headers: ${JSON.stringify(req.headers)}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);

    try {
        const axiosInstance: AxiosInstance = axios.create({ timeout: 10000 });

        const serviceResponse = await axiosInstance({
            method: req.method as any,
            url: serviceUrl,
            headers: {
                ...req.headers,
                host: new URL(baseServiceUrl).host,
            },
            data: req.body,
            proxy: false,
        });

        logger.info(`Received response from service - Status: ${serviceResponse.status}`);
        res.status(serviceResponse.status).json(serviceResponse.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            logger.error(`Axios error: ${axiosError.message}`);
            logger.error(`Request details: ${JSON.stringify({
                method: axiosError.config?.method,
                url: axiosError.config?.url,
                headers: axiosError.config?.headers,
                data: axiosError.config?.data,
            })}`);
            if (axiosError.response) {
                logger.error(`Response data: ${JSON.stringify(axiosError.response.data)}`);
            }
        } else {
            logger.error(`Non-Axios error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        logger.info('Attempting fallback with direct HTTP request...');
        const options = {
            hostname: new URL(baseServiceUrl).hostname,
            port: new URL(baseServiceUrl).port,
            path: req.originalUrl,
            method: req.method,
            headers: {
                ...req.headers,
                host: new URL(baseServiceUrl).host
            }
        };

        const forwardReq = http.request(options, (forwardRes) => {
            let data = '';
            forwardRes.on('data', (chunk) => data += chunk);
            forwardRes.on('end', () => {
                try {
                    logger.info(`Response from service (fallback): ${data}`);
                    const parsedData = JSON.parse(data);
                    res.status(forwardRes.statusCode || 500).json(parsedData);
                } catch (parseError) {
                    logger.error(`Error parsing fallback response: ${parseError}`);
                    res.status(forwardRes.statusCode || 500).json({ message: 'Failed to parse response from fallback' });
                }
            });
        });

        forwardReq.on('error', (httpError) => {
            logger.error(`Direct HTTP request error: ${httpError.message}`);
            res.status(500).json({ message: 'Failed to forward request directly via fallback' });
        });

        if (req.body && Object.keys(req.body).length > 0) {
            forwardReq.write(JSON.stringify(req.body));
        }
        forwardReq.end();
    }
});
export default router;