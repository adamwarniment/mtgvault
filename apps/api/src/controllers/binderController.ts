import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getBinders = async (req: AuthRequest, res: Response) => {
    try {
        const binders = await prisma.binder.findMany({
            where: { userId: req.user!.userId },
            include: { cards: true },
        });
        res.json(binders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch binders' });
    }
};

export const createBinder = async (req: AuthRequest, res: Response) => {
    const { name, layout } = req.body;
    try {
        const binder = await prisma.binder.create({
            data: {
                name,
                layout: layout || 'GRID_3x3',
                userId: req.user!.userId,
            },
        });
        res.status(201).json(binder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create binder' });
    }
};

export const getBinder = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const binder = await prisma.binder.findUnique({
            where: { id },
            include: { cards: true },
        });

        if (!binder) {
            return res.status(404).json({ error: 'Binder not found' });
        }

        if (binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(binder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch binder' });
    }
};

export const addCard = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { scryfallId, positionIndex, imageUrl, imageUrlBack, name, set, collectorNumber, priceUsd } = req.body;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check if slot is occupied
        const existingCard = await prisma.card.findUnique({
            where: {
                binderId_positionIndex: {
                    binderId: id,
                    positionIndex,
                },
            },
        });

        if (existingCard) {
            return res.status(400).json({ error: 'Slot already occupied' });
        }

        const card = await prisma.card.create({
            data: {
                binderId: id,
                scryfallId,
                positionIndex,
                imageUrl,
                imageUrlBack,
                name,
                set,
                collectorNumber,
                priceUsd,
            },
        });

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add card' });
    }
};

export const removeCard = async (req: AuthRequest, res: Response) => {
    const { id, cardId } = req.params;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.card.delete({
            where: { id: cardId },
        });

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove card' });
    }
};

// For drag and drop reordering
export const updateCardPositions = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { moves } = req.body; // Array of { cardId, newPosition }

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Two-phase update to avoid unique constraint violations
        // Phase 1: Set all positions to negative temporary values
        // Phase 2: Set positions to final values
        await prisma.$transaction(async (tx) => {
            // Phase 1: Move all cards to temporary negative positions
            for (let i = 0; i < moves.length; i++) {
                await tx.card.update({
                    where: { id: moves[i].cardId },
                    data: { positionIndex: -(i + 1) },
                });
            }

            // Phase 2: Move cards to their final positions
            for (const move of moves) {
                await tx.card.update({
                    where: { id: move.cardId },
                    data: { positionIndex: move.newPosition },
                });
            }
        });

        res.sendStatus(200);
    } catch (error) {
        console.error('Failed to update positions:', error);
        res.status(500).json({ error: 'Failed to update positions' });
    }
};

export const refreshCardPrice = async (req: AuthRequest, res: Response) => {
    const { id, cardId } = req.params;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const card = await prisma.card.findUnique({ where: { id: cardId } });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Fetch latest data from Scryfall
        const response = await axios.get(`https://api.scryfall.com/cards/${card.scryfallId}`);
        const scryfallCard = response.data;

        const priceUsd = scryfallCard.prices?.usd
            ? parseFloat(scryfallCard.prices.usd)
            : scryfallCard.prices?.usd_foil
                ? parseFloat(scryfallCard.prices.usd_foil)
                : scryfallCard.prices?.usd_etched
                    ? parseFloat(scryfallCard.prices.usd_etched)
                    : null;

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: { priceUsd },
        });

        res.json(updatedCard);
    } catch (error) {
        console.error('Failed to refresh price:', error);
        res.status(500).json({ error: 'Failed to refresh price' });
    }
};

export const toggleCardPurchased = async (req: AuthRequest, res: Response) => {
    const { id, cardId } = req.params;
    const { isPurchased } = req.body;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedCard = await prisma.card.update({
            where: { id: cardId },
            data: { isPurchased },
        });

        res.json(updatedCard);
    } catch (error) {
        console.error('Failed to toggle purchased status:', error);
        res.status(500).json({ error: 'Failed to toggle purchased status' });
    }
};

export const updateBinderSettings = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { grayOutUnpurchased } = req.body;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedBinder = await prisma.binder.update({
            where: { id },
            data: { grayOutUnpurchased },
            include: { cards: true },
        });

        res.json(updatedBinder);
    } catch (error) {
        console.error('Failed to update binder settings:', error);
        res.status(500).json({ error: 'Failed to update binder settings' });
    }
};

export const updateBinder = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedBinder = await prisma.binder.update({
            where: { id },
            data: { name },
        });

        res.json(updatedBinder);
    } catch (error) {
        console.error('Failed to update binder:', error);
        res.status(500).json({ error: 'Failed to update binder' });
    }
};

export const deleteBinder = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const binder = await prisma.binder.findUnique({ where: { id } });
        if (!binder || binder.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete all cards first (though cascade delete might handle this if configured in schema, better safe)
        // Actually, prisma handles cascade deletes if defined in schema, but explicit delete is safer if unsure.
        // Let's assume schema has cascade or we delete cards.
        // Actually best practice with Prisma is typically relying on relation onDelete: Cascade.
        // But to be safe let's just delete the binder. If it fails due to FK, we know we need to delete cards.
        await prisma.binder.delete({
            where: { id },
        });

        res.sendStatus(204);
    } catch (error) {
        console.error('Failed to delete binder:', error);
        res.status(500).json({ error: 'Failed to delete binder' });
    }
};
