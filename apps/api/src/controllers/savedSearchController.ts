import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getSavedSearches = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const savedSearches = await prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                query: true,
                createdAt: true,
            },
        });

        res.json(savedSearches);
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const createSavedSearch = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, query } = req.body;

        if (!name || !query) {
            return res.status(400).json({ error: 'Name and query are required' });
        }

        const savedSearch = await prisma.savedSearch.create({
            data: {
                name,
                query,
                userId,
            },
            select: {
                id: true,
                name: true,
                query: true,
                createdAt: true,
            },
        });

        res.status(201).json(savedSearch);
    } catch (error) {
        console.error('Error creating saved search:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const deleteSavedSearch = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        // Verify the saved search belongs to the user
        const savedSearch = await prisma.savedSearch.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!savedSearch) {
            return res.status(404).json({ error: 'Saved search not found' });
        }

        await prisma.savedSearch.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting saved search:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const bulkCreateSavedSearches = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { searches } = req.body;

        if (!Array.isArray(searches) || searches.length === 0) {
            return res.status(400).json({ error: 'Searches array is required' });
        }

        // Validate each search has name and query
        for (const search of searches) {
            if (!search.name || !search.query) {
                return res.status(400).json({ error: 'Each search must have name and query' });
            }
        }

        const savedSearches = await prisma.savedSearch.createMany({
            data: searches.map((search: { name: string; query: string }) => ({
                name: search.name,
                query: search.query,
                userId,
            })),
        });

        res.status(201).json({ count: savedSearches.count });
    } catch (error) {
        console.error('Error bulk creating saved searches:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
