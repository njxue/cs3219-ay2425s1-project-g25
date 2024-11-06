import express from 'express';
import {
  getUserHistoryEntries,
  createOrUpdateUserHistoryEntry,
  deleteUserHistoryEntry,
  deleteUserHistoryEntries,
  deleteAllUserHistoryEntries,
  removeRoomIdPresence,
} from '../controllers/historyController';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

router.get("/", authenticateToken, getUserHistoryEntries);
router.post("/", authenticateToken, createOrUpdateUserHistoryEntry);
router.post("/room/:id", authenticateToken, removeRoomIdPresence);
router.delete("/user/:id", authenticateToken, deleteUserHistoryEntry);
router.delete("/user", authenticateToken, deleteUserHistoryEntries);
router.delete("/all", authenticateToken, deleteAllUserHistoryEntries);

export default router;
