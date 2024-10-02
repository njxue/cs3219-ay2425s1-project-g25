import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 8080,
    baseServiceUrl: process.env.BASE_SERVICE_URL || 'http://localhost:3001',
};
