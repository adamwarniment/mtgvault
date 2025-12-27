import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get all wishlists for a user
export const getAllWishlists = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const wishlists = await prisma.wishlist.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { cards: true }
                }
            }
        });

        res.json(wishlists);
    } catch (error) {
        console.error('Error fetching wishlists:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Create a new wishlist
export const createWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const wishlist = await prisma.wishlist.create({
            data: {
                name,
                userId,
            }
        });

        res.status(201).json(wishlist);
    } catch (error) {
        console.error('Error creating wishlist:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Get a specific wishlist with its cards
export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const wishlist = await prisma.wishlist.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                cards: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Delete a wishlist
export const deleteWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;

        const wishlist = await prisma.wishlist.findFirst({
            where: { id, userId }
        });

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        await prisma.wishlist.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting wishlist:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Add card to wishlist
export const addCardToWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params; // wishlist id
        const { scryfallId, name, imageUrl, set, collectorNumber, priceUsd } = req.body;

        if (!scryfallId || !name || !imageUrl) {
            return res.status(400).json({ error: 'Missing card details' });
        }

        // Verify wishlist ownership
        const wishlist = await prisma.wishlist.findFirst({
            where: { id, userId }
        });

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        const card = await prisma.wishlistCard.create({
            data: {
                wishlistId: id,
                scryfallId,
                name,
                imageUrl,
                set,
                collectorNumber,
                priceUsd: priceUsd ? parseFloat(priceUsd) : null
            }
        });

        res.status(201).json(card);
    } catch (error) {
        console.error('Error adding card to wishlist:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Remove card from wishlist
export const removeCardFromWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id, cardId } = req.params; // wishlist id, card id (WishlistCard id, not Scryfall id)

        // Verify wishlist ownership
        const wishlist = await prisma.wishlist.findFirst({
            where: { id, userId }
        });

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        // Just delete the card, assuming the ID matches. 
        // We could verify the card belongs to the wishlist but if the ID is unique it's fine.
        // But safer to check.
        const card = await prisma.wishlistCard.findFirst({
            where: { id: cardId, wishlistId: id }
        });

        if (!card) {
            return res.status(404).json({ error: 'Card not found in wishlist' });
        }

        await prisma.wishlistCard.delete({
            where: { id: cardId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error removing card from wishlist:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
