import React from 'react';
import { Search, X, Loader2, RotateCw } from 'lucide-react';
import api from '../api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCard: (card: any) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectCard }) => {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [uniqueArtsOnly, setUniqueArtsOnly] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(false);

    if (!isOpen) return null;

    const SearchResultCard = ({ card, onSelect }: { card: any, onSelect: (card: any) => void }) => {
        const [isFlipped, setIsFlipped] = React.useState(false);

        // Determine images
        let frontImage = card.image_uris?.normal;
        let backImage = null;

        if (!frontImage && card.card_faces && card.card_faces.length === 2) {
            frontImage = card.card_faces[0].image_uris?.normal;
            backImage = card.card_faces[1].image_uris?.normal;
        }

        const handleFlip = (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
        }

        // Calculate price (prioritize USD, then Foil, then Etched)
        const price = card.prices?.usd || card.prices?.usd_foil || card.prices?.usd_etched;

        return (
            <div className="flex flex-col gap-2 group">
                <div
                    onClick={() => onSelect(card)}
                    className="relative w-full aspect-[63/88] rounded-lg cursor-pointer [perspective:1000px] hover:scale-105 transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/20"
                    role="button"
                >
                    {/* Flip Container */}
                    <div className={`w-full h-full relative transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg overflow-hidden">
                            {frontImage ? (
                                <img src={frontImage} alt={card.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center p-3 text-center">
                                    <p className="text-sm text-gray-400">{card.name}</p>
                                </div>
                            )}
                        </div>

                        {/* Back */}
                        {backImage && (
                            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden">
                                <img src={backImage} alt={card.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Pill + Flip Button */}
                <div className="flex items-center gap-2 justify-between">
                    {/* Pill: Name + Price */}
                    <div
                        className="flex-1 min-w-0 bg-gray-800/80 border border-gray-700/50 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors group/pill"
                        onClick={() => onSelect(card)}
                    >
                        <span className="text-xs font-medium text-gray-300 group-hover/pill:text-white truncate" title={card.name}>{card.name}</span>
                        {price && (
                            <span className="ml-auto flex-shrink-0 text-[10px] font-mono font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                                ${parseFloat(price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Flip Button (Outside) */}
                    {backImage && (
                        <button
                            onClick={handleFlip}
                            className="bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 p-1.5 rounded-full transition-all shrink-0"
                            title="Flip Card"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        )
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setResults([]);
        setPage(1);
        setHasMore(false);

        try {
            // Build search query with optional unique arts filter
            let searchQuery = query;
            if (uniqueArtsOnly) {
                searchQuery = `(${query}) (is:fullart or frame:showcase) unique:art order:rarity`;
            }

            const response = await api.get('/scryfall/cards', { params: { q: searchQuery, page: 1 } });
            setResults(response.data.data || []);
            setHasMore(response.data.has_more || false);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (loading || loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            let searchQuery = query;
            if (uniqueArtsOnly) {
                searchQuery = `(${query}) (is:fullart or frame:showcase) unique:art order:rarity`;
            }

            const nextPage = page + 1;
            const response = await api.get('/scryfall/cards', { params: { q: searchQuery, page: nextPage } });

            const newCards = response.data.data || [];
            setResults(prev => [...prev, ...newCards]);
            setHasMore(response.data.has_more || false);
            setPage(nextPage);
        } catch (error) {
            console.error('Failed to load more cards', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Load more when user is near bottom (100px buffer)
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            handleLoadMore();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl shadow-purple-500/20 animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3 border-b border-gray-800 flex justify-between items-center shrink-0 bg-gray-900/95 backdrop-blur z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Search className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-none">Search Cards</h2>
                            <p className="text-xs text-gray-400">Find cards from Scryfall</p>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Scrollable Content (Search + Results) */}
                <div
                    className="flex-1 overflow-y-auto"
                    onScroll={handleScroll}
                >
                    <div className="p-4 space-y-4">
                        {/* Search Form */}
                        <div className="space-y-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for a card... (e.g., Lightning Bolt, Valgavoth)"
                                    className="flex-1 h-9 text-sm"
                                    autoFocus
                                />
                                <Button type="submit" disabled={loading} size="sm" className="gap-2 h-9 px-4">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Searching
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-3.5 h-3.5" />
                                            Search
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Filter Options */}
                            <div className="flex items-center gap-2 px-1">
                                <button
                                    type="button"
                                    onClick={() => setUniqueArtsOnly(!uniqueArtsOnly)}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                        transition-all duration-200 border
                                        ${uniqueArtsOnly
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                                        }
                                    `}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-3.5 h-3.5"
                                    >
                                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                                    </svg>
                                    Unique Arts Only
                                </button>
                                <div className="relative group">
                                    <span className="text-[10px] text-gray-500 cursor-help border border-gray-700 rounded-full w-3.5 h-3.5 flex items-center justify-center">?</span>
                                    <div className="absolute left-0 top-6 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-lg p-2 w-56 shadow-xl z-10">
                                        <p className="text-[10px] text-gray-300">
                                            When enabled, searches for unique full-art or showcase frame cards,
                                            sorted by rarity. Wraps your search and filters for special card art variations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-800/50" />

                        {/* Results Grid */}
                        <div>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-purple-500" />
                                    <p>Searching Scryfall...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Search className="w-16 h-16 mb-4 text-gray-700" />
                                    <p className="text-lg font-medium">No results yet</p>
                                    <p className="text-sm">Search for a card to get started</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm text-gray-400">
                                            Found {results.length} {results.length === 1 ? 'card' : 'cards'}
                                        </p>
                                        {uniqueArtsOnly && (
                                            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                                Unique Arts Only
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {results.map((card) => (
                                            <SearchResultCard
                                                key={card.id}
                                                card={card}
                                                onSelect={onSelectCard}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Loading More Indicator */}
                            {loadingMore && (
                                <div className="w-full py-6 flex flex-col items-center justify-center text-gray-400 animate-in fade-in slide-in-from-bottom-4">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" />
                                    <p className="text-sm font-medium">Loading more cards...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SearchModal;
