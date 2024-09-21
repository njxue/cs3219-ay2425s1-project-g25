import cors from 'cors';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import questionsRoutes from './routes/questionsRoutes'
import { connectToDatabase } from './utils/database';

dotenv.config();

connectToDatabase();

const port = process.env.PORT || 3001;
const app: Express = express();

app.use(express.json());

app.use(cors());

app.use('/api/questions', questionsRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
