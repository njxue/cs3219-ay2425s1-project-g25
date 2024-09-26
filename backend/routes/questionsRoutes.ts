import express from 'express';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestion
} from '../controllers/questionsController';

const router = express.Router();

router.get('/', getAllQuestions);
router.post('/', createQuestion);
router.put('/:code', updateQuestion);
router.delete('/:code', deleteQuestion);
router.get('/:code', getQuestion);

export default router;