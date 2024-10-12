import cors from 'cors';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './utils/database';
import { errorHandler } from './middlewares/errorHandler';
import matchingRoutes from './routes/matchingRoutes';
import http from 'http'; // Needed to create the HTTP server
import { Server } from 'socket.io'; // Import Socket.io

dotenv.config({ path: path.resolve(__dirname, './.env') });

connectToDatabase();

const port = process.env.PORT || 3003;
const app: Express = express();

// Create an HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for the demo
    },
});

app.use(express.json());

app.use('/api/match', matchingRoutes);

app.use(cors({
  origin: '*', // Allows all origins
  credentials: true,
}));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Export io for use in controllers:
export { io };