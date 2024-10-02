import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express'; // Import swagger-ui-express
import swaggerJsDoc from 'swagger-jsdoc'; // Import swagger-jsdoc
import logger from './utils/logger';
import router from './routes/gateway';

// Load environment variables from the .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Gateway',
            version: '1.0.0',
            description: 'API Gateway for routing requests to various microservices',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/gateway.ts', './src/routes/*.ts'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions); // Generate Swagger documentation

// Middleware to parse JSON requests
app.use(express.json());

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use the Gateway router for forwarding requests to microservices
app.use('/', router);

// Global error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    logger.error(`Error: ${message}, Status Code: ${statusCode}`);
    res.status(statusCode).json({ message });
});

// Start the server
app.listen(port, () => {
    logger.info(`API Gateway running on http://localhost:${port}`);
    logger.info(`Swagger UI available at http://localhost:${port}/api-docs`);
});
