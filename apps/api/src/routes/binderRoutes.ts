import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getBinders,
    createBinder,
    getBinder,
    addCard,
    removeCard,
    updateCardPositions,
} from '../controllers/binderController';

const router = Router();

router.use(authenticateToken);

router.get('/', getBinders);
router.post('/', createBinder);
router.get('/:id', getBinder);
router.post('/:id/cards', addCard);
router.delete('/:id/cards/:cardId', removeCard);
router.put('/:id/reorder', updateCardPositions);

export default router;
