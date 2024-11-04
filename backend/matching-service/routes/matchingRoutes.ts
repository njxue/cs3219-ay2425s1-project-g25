import { cancelMatch, startMatching } from '../controllers/matchingController';
import express from 'express';

const router = express.Router();

router.get("/test", (req, res) => { res.send("OK!"); });
router.post('/', startMatching);
router.delete('/:socketId', cancelMatch)

export default router;