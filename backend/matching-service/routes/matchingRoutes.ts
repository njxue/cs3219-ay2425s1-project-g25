import { getRoomDetails } from '../controllers/roomController';
import { cancelMatch, startMatching } from '../controllers/matchingController';
import express from 'express';
import { verifyAccessToken } from '../middlewares/basic-access-control';
import { authenticateToken } from 'middlewares/auth';

const router = express.Router();

router.post('/', authenticateToken, startMatching);
router.delete('/:socketId', authenticateToken, cancelMatch)
router.get('/room/:roomId', authenticateToken, getRoomDetails)

export default router;