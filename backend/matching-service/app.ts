import cors from 'cors';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './utils/database';
import { errorHandler } from './middlewares/errorHandler';
import matchingRoutes from './routes/matchingRoutes';
import http from 'http';
import { initSocket } from './utils/socket';
import { setupSocketListeners } from './controllers/matchingController';

dotenv.config({ path: path.resolve(__dirname, './.env') });

connectToDatabase();

const port = process.env.PORT || 3003;
const app: Express = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

app.use(express.json());

app.use('/api/match', matchingRoutes);

app.use(cors({
  origin: '*', // Allows all origins
  credentials: true,
}));

app.use(errorHandler);

// Start the server using the HTTP server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);

  // Set up socket listeners:
  setupSocketListeners();
});
