import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                themeMode: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const updateThemeMode = async (req: AuthRequest, res: Response) => {
    const { themeMode } = req.body;

    if (!themeMode || !['dark', 'light'].includes(themeMode)) {
        return res.status(400).json({ error: 'Invalid theme mode. Must be "dark" or "light"' });
    }

    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { themeMode },
            select: {
                id: true,
                email: true,
                themeMode: true,
            },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
};

