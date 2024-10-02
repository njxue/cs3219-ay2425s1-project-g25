import express, { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';

const app = express();
const port = 8080;

// Microservices URLs (modify these based on your setup)
const services: Record<string, string> = {
    serviceA: 'http://localhost:3001',
    serviceB: 'http://localhost:3002',
};

// Middleware to parse JSON
app.use(express.json());

// Error-handling middleware for async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Gateway route to forward requests to microservices
app.all(
    '/:serviceName/*',
    asyncHandler(async (req: Request, res: Response) => {
        const { serviceName } = req.params;
        const serviceUrl = services[serviceName];

        if (!serviceUrl) {
            return res.status(404).json({ error: 'Service not found' });
        }

        try {
            // Forward the request to the respective microservice
            const serviceResponse: AxiosResponse = await axios({
                method: req.method,
                url: `${serviceUrl}/${req.params[0]}`,
                headers: req.headers,
                data: req.body,
            });

            // Forward the response from the microservice back to the client
            res.status(serviceResponse.status).json(serviceResponse.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error forwarding the request' });
        }
    })
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// Start the API Gateway
app.listen(port, () => {
    console.log(`API Gateway running at http://localhost:${port}`);
});
