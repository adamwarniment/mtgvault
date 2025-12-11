import { Request, Response } from 'express';
import axios from 'axios';

const SCRYFALL_API_URL = 'https://api.scryfall.com';

export const searchCards = async (req: Request, res: Response) => {
    const { q, page } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const response = await axios.get(`${SCRYFALL_API_URL}/cards/search`, {
            params: { q, page },
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Scryfall' });
    }
};
