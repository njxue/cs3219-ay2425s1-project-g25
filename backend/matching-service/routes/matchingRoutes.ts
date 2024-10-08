import { getMatch } from '../controllers/matchingController';
import express from 'express';

const router = express.Router();

router.post('/', getMatch);

export default router;