import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getAllWishlists,
    createWishlist,
    getWishlist,
    deleteWishlist,
    addCardToWishlist,
    removeCardFromWishlist
} from '../controllers/wishlistController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllWishlists);
router.post('/', createWishlist);
router.get('/:id', getWishlist);
router.delete('/:id', deleteWishlist);
router.post('/:id/cards', addCardToWishlist);
router.delete('/:id/cards/:cardId', removeCardFromWishlist);

export default router;
