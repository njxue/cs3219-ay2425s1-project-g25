import express from 'express';
import {
  getUserHistoryEntries,
  createOrUpdateUserHistoryEntry,
  deleteUserHistoryEntry,
  deleteUserHistoryEntries,
  deleteAllUserHistoryEntries,
} from '../controllers/historyController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticateToken, getUserHistoryEntries);
router.post('/', authenticateToken, createOrUpdateUserHistoryEntry);
router.delete('/:id', authenticateToken, deleteUserHistoryEntry);
router.delete('/', authenticateToken, deleteUserHistoryEntries);
router.delete('/all', authenticateToken, deleteAllUserHistoryEntries);

export default router;
