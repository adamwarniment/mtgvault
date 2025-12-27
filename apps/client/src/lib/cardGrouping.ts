
export type GroupingOption = 'none' | 'promo_types' | 'rarity' | 'color' | 'type';

export interface Card {
    id: string;
    name: string;
    promo_types?: string[];
    frame_effects?: string[];
    rarity?: string;
    colors?: string[];
    type_line?: string;
    [key: string]: any;
}

const COLOR_MAP: Record<string, string> = {
    'W': 'White',
    'U': 'Blue',
    'B': 'Black',
    'R': 'Red',
    'G': 'Green'
};

const TYPE_PRIORITY = ['Land', 'Creature', 'Artifact', 'Enchantment', 'Planeswalker', 'Instant', 'Sorcery', 'Battle'];
const IGNORED_FRAME_EFFECTS = ['character', 'enchantment', 'artifact', 'creature', 'land', 'planeswalker', 'legendary'];

export const groupCards = (cards: Card[], groupBy: GroupingOption): Record<string, Card[]> => {
    if (groupBy === 'none') {
        return { 'All Cards': cards };
    }

    const groups: Record<string, Card[]> = {};

    cards.forEach(card => {
        let key = 'Other';

        switch (groupBy) {
            case 'promo_types':
                const promos = card.promo_types || [];
                const frames = (card.frame_effects || []).filter(Effect => !IGNORED_FRAME_EFFECTS.includes(Effect.toLowerCase()));

                let combined = [...new Set([...promos, ...frames])];

                // "boosterfun" is often redundant if other effects exist. Only show it if it's the only one.
                if (combined.length > 1 && combined.includes('boosterfun')) {
                    combined = combined.filter(t => t !== 'boosterfun');
                }

                if (combined.length > 0) {
                    key = combined
                        .map(t => t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
                        .join(' / ');
                } else {
                    key = 'Draft Cards';
                }
                break;
            case 'rarity':
                key = card.rarity ? (card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)) : 'Unknown';
                break;
            case 'color':
                if (!card.colors || card.colors.length === 0) {
                    key = 'Colorless';
                } else if (card.colors.length > 1) {
                    key = 'Multicolor';
                } else {
                    key = COLOR_MAP[card.colors[0]] || 'Unknown';
                }
                break;
            case 'type':
                if (card.type_line) {
                    const mainType = card.type_line.split('—')[0];
                    // Clean up supertypes
                    const cleaned = mainType
                        .replace('Legendary', '')
                        .replace('Basic', '')
                        .replace('Snow', '')
                        .replace('World', '')
                        .replace('Tribal', '')
                        .trim();

                    // Find the first matching major type
                    const foundType = TYPE_PRIORITY.find(t => cleaned.includes(t));
                    key = foundType || cleaned.split(' ')[0] || 'Unknown';
                } else {
                    key = 'Unknown';
                }
                break;
        }

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(card);
    });

    // Sort keys?
    // Maybe we just let JS object key order handle it somewhat, or returns entries to sort?
    // User didn't specify sort order, but consistent order is nice.
    // For now, simple object return is fine, we can sort keys in UI.

    return groups;
};

export const SortGroupsKeys = (keys: string[], groupBy: GroupingOption): string[] => {
    // Custom sort logic if needed, e.g. Rarity (Common -> Mythic)
    if (groupBy === 'rarity') {
        const order = ['Common', 'Uncommon', 'Rare', 'Mythic Rare', 'Special', 'Bonus'];
        return keys.sort((a, b) => {
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA === -1 && idxB === -1) return a.localeCompare(b);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    }
    if (groupBy === 'color') {
        const order = ['White', 'Blue', 'Black', 'Red', 'Green', 'Multicolor', 'Colorless'];
        return keys.sort((a, b) => {
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA === -1 && idxB === -1) return a.localeCompare(b);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    }
    if (groupBy === 'promo_types') {
        return keys.sort((a, b) => {
            if (a === 'Draft Cards') return -1;
            if (b === 'Draft Cards') return 1;
            return a.localeCompare(b);
        });
    }

    return keys.sort();
}
