import { Router } from 'express';
import { searchCards } from '../controllers/searchController';

const router = Router();

router.get('/cards', searchCards);

export default router;
