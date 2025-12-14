import { Router } from 'express';
import { getProfile, updateThemeMode } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.patch('/theme', authenticateToken, updateThemeMode);

export default router;
