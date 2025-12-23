import { Router } from 'express';
import {
    getSavedSearches,
    createSavedSearch,
    deleteSavedSearch,
    bulkCreateSavedSearches,
} from '../controllers/savedSearchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getSavedSearches);
router.post('/', authenticateToken, createSavedSearch);
router.post('/bulk', authenticateToken, bulkCreateSavedSearches);
router.delete('/:id', authenticateToken, deleteSavedSearch);

export default router;
