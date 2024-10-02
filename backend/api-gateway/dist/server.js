"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = __importDefault(require("./utils/logger"));
const router = express_1.default.Router();
// Base URL for the microservices (since both auth and users are on the same port)
const baseServiceUrl = config_1.config.baseServiceUrl || 'http://localhost:3001';
// Forward the request based on the path (either /auth/* or /users/*)
router.all('/*', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const servicePath = req.path.split('/')[1]; // Extract the service path (e.g., 'auth' or 'users')
    if (servicePath !== 'auth' && servicePath !== 'users') {
        return next(new errorHandler_1.AppError('Service not found', 404));
    }
    try {
        // Forward the request to the correct service based on the path
        const serviceUrl = `${baseServiceUrl}${req.originalUrl}`;
        const serviceResponse = yield (0, axios_1.default)({
            method: req.method,
            url: serviceUrl,
            headers: req.headers,
            data: req.body,
        });
        res.status(serviceResponse.status).json(serviceResponse.data);
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`Failed to forward request to ${servicePath}: ${error.message}`);
            return next(new errorHandler_1.AppError('Error forwarding the request', 500));
        }
        else {
            logger_1.default.error(`An unknown error occurred while forwarding the request`);
            return next(new errorHandler_1.AppError('Unknown error forwarding the request', 500));
        }
    }
}));
exports.default = router;
