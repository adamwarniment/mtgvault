import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
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
    const [showUniquePrints, setShowUniquePrints] = React.useState(true);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        try {
            // Build search query with optional unique prints filter
            let searchQuery = query;
            if (showUniquePrints) {
                searchQuery = `${query} (game:paper) unique:prints prefer:best`;
            }

            const response = await api.get('/scryfall/cards', { params: { q: searchQuery } });
            setResults(response.data.data || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
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
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Search className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Search Cards</h2>
                            <p className="text-sm text-gray-400">Find cards from Scryfall</p>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Search Form */}
                <div className="p-6 border-b border-gray-800 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <Input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a card... (e.g., Lightning Bolt, Valgavoth)"
                            className="flex-1"
                            autoFocus
                        />
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Search
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Filter Options */}
                    <div className="flex items-center gap-3 px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showUniquePrints}
                                onChange={(e) => setShowUniquePrints(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                Show unique variations only
                            </span>
                        </label>
                        <div className="relative group">
                            <span className="text-xs text-gray-500 cursor-help">ⓘ</span>
                            <div className="absolute left-0 top-6 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-lg p-3 w-64 shadow-xl z-10">
                                <p className="text-xs text-gray-300">
                                    When enabled, searches for unique card variations (different art, special editions)
                                    from paper Magic sets, showing the best version of each.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
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
                                {showUniquePrints && (
                                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                        Unique prints only
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {results.map((card) => (
                                    <button
                                        key={card.id}
                                        onClick={() => onSelectCard(card)}
                                        className="group relative rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {card.image_uris ? (
                                            <img
                                                src={card.image_uris.normal}
                                                alt={card.name}
                                                className="w-full rounded-lg"
                                            />
                                        ) : (
                                            <div className="aspect-[63/88] bg-gray-800 rounded-lg flex items-center justify-center text-center p-3">
                                                <p className="text-sm text-gray-400">{card.name}</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-start justify-end p-3">
                                            <p className="text-white text-sm font-medium truncate w-full">{card.name}</p>
                                            {card.set && (
                                                <p className="text-purple-300 text-xs font-mono uppercase">{card.set}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SearchModal;
