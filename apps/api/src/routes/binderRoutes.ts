import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getBinders,
    createBinder,
    getBinder,
    addCard,
    removeCard,
    updateCardPositions,
    refreshCardPrice,
    toggleCardPurchased,
    updateBinderSettings,
} from '../controllers/binderController';

const router = Router();

router.use(authenticateToken);

router.get('/', getBinders);
router.post('/', createBinder);
router.get('/:id', getBinder);
router.post('/:id/cards', addCard);
router.delete('/:id/cards/:cardId', removeCard);
router.put('/:id/reorder', updateCardPositions);
router.put('/:id/cards/:cardId/refresh-price', refreshCardPrice);
router.put('/:id/cards/:cardId/purchased', toggleCardPurchased);
router.put('/:id/settings', updateBinderSettings);

export default router;
