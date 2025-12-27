import React from 'react';
import { Search, X, Loader2, RotateCw, ZoomIn, ZoomOut, Save, Trash2, Book, ExternalLink, Layers, Heart } from 'lucide-react';
import api from '../api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { groupCards, type GroupingOption, SortGroupsKeys } from '../lib/cardGrouping';
import { CollapsibleSection } from './ui/CollapsibleSection';

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

    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(false);
    const [zoomLevel, setZoomLevel] = React.useState(160);
    const [savedSearches, setSavedSearches] = React.useState<{ id: string, name: string, query: string }[]>([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
    const [newSearchName, setNewSearchName] = React.useState('');
    const [showSavedSearches, setShowSavedSearches] = React.useState(false);
    const [showSyntaxGuide, setShowSyntaxGuide] = React.useState(false);
    const [groupBy, setGroupBy] = React.useState<GroupingOption>('none');
    const searchContainerRef = React.useRef<HTMLDivElement>(null);

    // Wishlist Mode State
    const [mode, setMode] = React.useState<'search' | 'wishlist'>('search');
    const [wishlists, setWishlists] = React.useState<any[]>([]);
    const [selectedWishlistId, setSelectedWishlistId] = React.useState<string | null>(null);
    const [wishlistCards, setWishlistCards] = React.useState<any[]>([]);
    const [loadingWishlist, setLoadingWishlist] = React.useState(false);

    // Load wishlists when switching to wishlist mode
    React.useEffect(() => {
        if (mode === 'wishlist' && wishlists.length === 0) {
            const fetchWishlists = async () => {
                try {
                    const response = await api.get('/wishlists');
                    setWishlists(response.data);
                } catch (error) {
                    console.error('Failed to fetch wishlists', error);
                }
            };
            fetchWishlists();
        }
    }, [mode]);

    // Load wishlist cards when selections changes
    React.useEffect(() => {
        if (selectedWishlistId) {
            const fetchWishlistCards = async () => {
                setLoadingWishlist(true);
                try {
                    const response = await api.get(`/wishlists/${selectedWishlistId}`);
                    // The API returns the wishlist object with a 'cards' array
                    setWishlistCards(response.data.cards || []);
                } catch (error) {
                    console.error('Failed to fetch wishlist cards', error);
                } finally {
                    setLoadingWishlist(false);
                }
            };
            fetchWishlistCards();
        } else {
            setWishlistCards([]);
        }
    }, [selectedWishlistId]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSavedSearches(false);
            }
        };

        if (showSavedSearches) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSavedSearches]);

    React.useEffect(() => {
        const loadSavedSearches = async () => {
            try {
                // First, try to fetch from the API
                const response = await api.get('/saved-searches');
                const apiSearches = response.data;

                // Check if we have any searches in localStorage that need to be migrated
                const localStorageKey = 'mtg-vault-saved-searches';
                const localSaved = localStorage.getItem(localStorageKey);

                if (localSaved && apiSearches.length === 0) {
                    // We have localStorage data but nothing in the API - migrate it
                    try {
                        const localSearches = JSON.parse(localSaved);
                        if (Array.isArray(localSearches) && localSearches.length > 0) {
                            // Bulk create the searches in the API
                            await api.post('/saved-searches/bulk', { searches: localSearches });

                            // Fetch again to get the searches with proper IDs
                            const migratedResponse = await api.get('/saved-searches');
                            setSavedSearches(migratedResponse.data);

                            // Clear localStorage after successful migration
                            localStorage.removeItem(localStorageKey);
                            console.log('Successfully migrated saved searches from localStorage to server');
                        } else {
                            setSavedSearches(apiSearches);
                        }
                    } catch (e) {
                        console.error('Failed to migrate saved searches', e);
                        setSavedSearches(apiSearches);
                    }
                } else {
                    // Just use the API data
                    setSavedSearches(apiSearches);
                }
            } catch (error) {
                console.error('Failed to load saved searches', error);
            }
        };

        loadSavedSearches();
    }, []);



    const handleSaveSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSearchName.trim()) return;

        try {
            const response = await api.post('/saved-searches', {
                name: newSearchName,
                query
            });

            setSavedSearches([...savedSearches, response.data]);
            setIsSaveModalOpen(false);
            setNewSearchName('');
        } catch (error) {
            console.error('Failed to save search', error);
            // Optionally show an error message to the user
        }
    };



    const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await api.delete(`/saved-searches/${id}`);
            const newSaved = savedSearches.filter(s => s.id !== id);
            setSavedSearches(newSaved);
        } catch (error) {
            console.error('Failed to delete search', error);
            // Optionally show an error message to the user
        }
    };


    const loadSavedSearch = (savedQuery: string) => {
        setQuery(savedQuery);
        setShowSavedSearches(false);
    };

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
                    className="relative w-full aspect-[63/88] rounded-lg cursor-pointer [perspective:1000px] hover:scale-105 transition-all shadow-md hover:shadow-xl hover:shadow-blue-500/20"
                    role="button"
                >
                    {/* Flip Container */}
                    <div className={`w-full h-full relative transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        {/* Front */}
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                            {frontImage ? (
                                <img src={frontImage} alt={card.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-3 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.name}</p>
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
                        className="flex-1 min-w-0 border rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-colors group/pill"
                        style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-secondary)'
                        }}
                        onClick={() => onSelect(card)}
                    >
                        <span className="text-xs font-medium truncate group-hover/pill:opacity-100 opacity-90" style={{ color: 'var(--text-primary)' }} title={card.name}>{card.name}</span>
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
                            className="border p-1.5 rounded-full transition-all shrink-0 hover:opacity-100 opacity-70"
                            style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border-secondary)',
                                color: 'var(--text-secondary)'
                            }}
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
            // Build search query
            const searchQuery = query;
            let allCards: any[] = [];
            let currentPage = 1;
            let hasNext = true;

            while (hasNext) {
                const response = await api.get('/scryfall/cards', { params: { q: searchQuery, page: currentPage } });
                const { data, has_more } = response.data;

                if (data) {
                    allCards = [...allCards, ...data];
                }

                hasNext = has_more;
                currentPage++;

                // Small delay to be respectful to rate limits
                if (hasNext) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            setResults(allCards);
            setHasMore(false);
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
            const searchQuery = query;

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

    const getFilteredSavedSearches = (searchQuery: string) => {
        if (!searchQuery) return savedSearches;
        const lowerQuery = searchQuery.toLowerCase();
        return savedSearches.filter(s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.query.toLowerCase().includes(lowerQuery)
        );
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        if (newQuery) {
            const matches = getFilteredSavedSearches(newQuery);
            if (matches.length > 0) {
                setShowSavedSearches(true);
            } else {
                setShowSavedSearches(false);
            }
        } else {
            setShowSavedSearches(false);
        }
    };

    // Memoize the displayed searches so we can use it in the render
    const displaySavedSearches = getFilteredSavedSearches(query);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Load more when user is near bottom (100px buffer)
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            handleLoadMore();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl animate-in relative rounded-xl overflow-hidden"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="p-3 border-b flex justify-between items-center shrink-0 backdrop-blur z-20"
                    style={{ borderColor: 'var(--border-primary)' }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Search className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>Search Cards</h2>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Find cards from Scryfall</p>
                        </div>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8" style={{ color: 'var(--text-secondary)' }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Scrollable Content (Search + Results) */}
                <div
                    className="flex-1 overflow-y-auto relative"
                    onScroll={handleScroll}
                >
                    <div className="p-4 space-y-4">
                        {/* Mode Toggle */}
                        <div className="flex p-1 rounded-lg border w-full max-w-sm mx-auto mb-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                            <button
                                onClick={() => setMode('search')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'search' ? 'shadow-sm text-blue-500 bg-black/5 dark:bg-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>
                            <button
                                onClick={() => setMode('wishlist')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'wishlist' ? 'shadow-sm text-pink-500 bg-black/5 dark:bg-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Heart className="w-4 h-4" />
                                From Wishlist
                            </button>
                        </div>

                        {mode === 'search' ? (
                            <>
                                {/* Search Form */}
                                <div className="space-y-2">
                                    <form onSubmit={handleSearch} className="flex gap-2 relative z-40">
                                        <button
                                            type="button"
                                            onClick={() => setShowSyntaxGuide(!showSyntaxGuide)}
                                            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 font-bold shrink-0"
                                            style={{
                                                borderColor: showSyntaxGuide ? 'var(--blue-500)' : 'var(--border-secondary)',
                                                color: showSyntaxGuide ? 'var(--blue-500)' : 'var(--text-secondary)',
                                                backgroundColor: showSyntaxGuide ? 'var(--blue-500-10)' : 'var(--bg-tertiary)',
                                            }}
                                            title={showSyntaxGuide ? "Hide Syntax Guide" : "Show Syntax Guide"}
                                        >
                                            ?
                                        </button>

                                        <div className="relative flex-1 group" ref={searchContainerRef}>
                                            <Input
                                                type="text"
                                                value={query}
                                                onChange={handleQueryChange}
                                                onFocus={() => {
                                                    if (savedSearches.length > 0 && !query) {
                                                        // Optional: open on focus if desired
                                                    }
                                                }}
                                                placeholder="Search for a card... (e.g., Lightning Bolt, Valgavoth)"
                                                className={`w-full h-9 text-sm focus:ring-blue-500 focus:border-blue-500 pl-[5.5rem] pr-9 transition-all ${showSavedSearches ? 'rounded-b-none border-b-transparent focus:ring-0 focus:border-b-transparent z-50 relative' : ''}`}
                                                autoFocus
                                                style={{
                                                    // When open, ensure the input blends with the dropdown
                                                    borderBottomColor: showSavedSearches ? 'transparent' : undefined,
                                                    boxShadow: showSavedSearches ? 'none' : undefined
                                                }}
                                            />

                                            {/* Saved Searches Toggle (Left) */}
                                            <div className="absolute left-1 top-1 bottom-1 flex items-center z-50">
                                                <div className="relative">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowSavedSearches(!showSavedSearches)}
                                                        className={`h-full gap-1.5 text-xs px-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md ${showSavedSearches ? 'bg-black/5 dark:bg-white/5' : ''}`}
                                                        style={{
                                                            color: 'var(--text-secondary)'
                                                        }}
                                                    >
                                                        <Book className="w-3.5 h-3.5" />
                                                        Saved
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Save Current Search Button (Right) */}
                                            {query && (
                                                <div className="absolute right-1 top-1 bottom-1 flex items-center z-50">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsSaveModalOpen(true)}
                                                        className="h-full w-7 p-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-md"
                                                        title="Save current search"
                                                        style={{ color: 'var(--text-secondary)' }}
                                                    >
                                                        <Save className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Dropdown - Now Full Width & Merged */}
                                            {showSavedSearches && (
                                                <div className="absolute top-[calc(100%-1px)] left-0 right-0 rounded-b-lg shadow-xl border z-40 overflow-hidden animate-in fade-in slide-in-from-top-1"
                                                    style={{
                                                        backgroundColor: 'var(--input-bg)', // Match Input background
                                                        borderColor: 'var(--border-primary)', // or match input border
                                                        borderTopWidth: 0
                                                    }}>

                                                    {/* Header - Optional or Hidden since we're "merging" */}
                                                    {/* <div className="p-2 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                                                <p className="text-xs font-medium px-2" style={{ color: 'var(--text-secondary)' }}>Saved Searches</p>
                                            </div> */}

                                                    <div className="max-h-60 overflow-y-auto py-1">
                                                        {displaySavedSearches.length === 0 ? (
                                                            <div className="p-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                                No saved searches
                                                            </div>
                                                        ) : (
                                                            displaySavedSearches.map(search => (
                                                                <div key={search.id}
                                                                    onClick={() => loadSavedSearch(search.query)}
                                                                    className="flex items-center justify-between px-3 py-2 hover:bg-blue-500/10 cursor-pointer group/item border-l-2 border-transparent hover:border-blue-500 transition-all"
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{search.name}</p>
                                                                        <p className="text-xs truncate font-mono opacity-75" style={{ color: 'var(--text-tertiary)' }}>{search.query}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => handleDeleteSearch(search.id, e)}
                                                                        className="p-1.5 rounded-md opacity-0 group-hover/item:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                                                        title="Delete Saved Search"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={loading} size="sm" className="gap-2 h-9 px-4 bg-green-600 hover:bg-green-700 text-white border-transparent shrink-0">
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

                                    {/* Syntax Guide Embed */}
                                    {showSyntaxGuide && (
                                        <div className="mt-4 rounded-xl border overflow-hidden h-96 relative bg-white">
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
                                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    <span className="text-sm">Loading Syntax Guide...</span>
                                                </div>
                                            </div>
                                            <iframe
                                                src="/syntax-guide.html"
                                                className="w-full h-full relative z-10"
                                                title="Scryfall Syntax Guide"
                                            />
                                            <button
                                                onClick={() => setShowSyntaxGuide(false)}
                                                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 shadow hover:bg-white text-gray-500 hover:text-gray-700 transition-colors"
                                                title="Close Syntax Guide"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 right-2 z-20">
                                                <a href="https://scryfall.com/docs/syntax" target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs bg-white/90 px-2 py-1 rounded shadow text-blue-600 hover:underline">
                                                    Open in new tab <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full" style={{ backgroundColor: 'var(--border-secondary)' }} />

                                {/* Results Grid */}
                                <div>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
                                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
                                            <p>Searching Scryfall...</p>
                                        </div>
                                    ) : results.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
                                            <Search className="w-16 h-16 mb-4" />
                                            <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No results yet</p>
                                            <p className="text-sm">Search for a card to get started</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                    Found {results.length} {results.length === 1 ? 'card' : 'cards'}
                                                </p>
                                            </div>
                                            {groupBy === 'none' ? (
                                                <div
                                                    className="grid gap-4 transition-all duration-200 ease-out"
                                                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                                >
                                                    {results.map((card) => (
                                                        <SearchResultCard
                                                            key={card.id}
                                                            card={card}
                                                            onSelect={onSelectCard}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {SortGroupsKeys(Object.keys(groupCards(results, groupBy)), groupBy).map(groupName => {
                                                        const group = groupCards(results, groupBy)[groupName];
                                                        return (
                                                            <CollapsibleSection
                                                                key={groupName}
                                                                title={groupName}
                                                                count={group.length}
                                                            >
                                                                <div
                                                                    className="grid gap-4 transition-all duration-200 ease-out"
                                                                    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                                                >
                                                                    {group.map((card) => (
                                                                        <SearchResultCard
                                                                            key={card.id}
                                                                            card={card}
                                                                            onSelect={onSelectCard}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </CollapsibleSection>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Loading More Indicator */}
                                    {loadingMore && (
                                        <div className="w-full py-6 flex flex-col items-center justify-center text-gray-400 animate-in fade-in slide-in-from-bottom-4">
                                            <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                                            <p className="text-sm font-medium">Loading more cards...</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* Wishlist Selection */}
                                <div className="w-full max-w-lg mx-auto">
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Select Wishlist</label>
                                    <select
                                        value={selectedWishlistId || ''}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedWishlistId(id === '' ? null : id);
                                        }}
                                        className="w-full h-10 rounded-lg px-3 bg-transparent border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--border-primary)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <option value="">-- Choose a Wishlist --</option>
                                        {wishlists.map((wl) => (
                                            <option key={wl.id} value={wl.id}>
                                                {wl.name} ({wl._count?.cards || 0} cards)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Wishlist Content */}
                                <div className="min-h-[300px]">
                                    {loadingWishlist ? (
                                        <div className="flex flex-col items-center justify-center h-40" style={{ color: 'var(--text-tertiary)' }}>
                                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-pink-500" />
                                            <p>Loading wishlist cards...</p>
                                        </div>
                                    ) : !selectedWishlistId ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-center p-4 border rounded-xl border-dashed"
                                            style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-tertiary)' }}>
                                            <Heart className="w-10 h-10 mb-2 opacity-50" />
                                            <p>Select a wishlist to view and add cards.</p>
                                        </div>
                                    ) : wishlistCards.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-40 text-center p-4"
                                            style={{ color: 'var(--text-tertiary)' }}>
                                            <p>This wishlist is empty.</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                    Showing {wishlistCards.length} cards from wishlist
                                                </p>
                                            </div>

                                            <div
                                                className="grid gap-4 transition-all duration-200 ease-out"
                                                style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                            >
                                                {wishlistCards.map((wCard) => {
                                                    const card = {
                                                        id: wCard.scryfallId,
                                                        name: wCard.name,
                                                        set: wCard.set,
                                                        collector_number: wCard.collectorNumber,
                                                        image_uris: { normal: wCard.imageUrl },
                                                        prices: { usd: wCard.priceUsd ? wCard.priceUsd.toString() : null },
                                                    };

                                                    return (
                                                        <SearchResultCard
                                                            key={wCard.id}
                                                            card={card}
                                                            onSelect={onSelectCard}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>



                {/* Save Search Name Modal */}
                {isSaveModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-2xl scale-100"
                            onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-4 text-white">Save Search</h3>
                            <form onSubmit={handleSaveSearch}>
                                <Input
                                    autoFocus
                                    placeholder="e.g. My Favorite Lands"
                                    value={newSearchName}
                                    onChange={e => setNewSearchName(e.target.value)}
                                    className="mb-4 bg-zinc-800 border-zinc-700 text-white"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsSaveModalOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Card>

            {/* Floating Controls (Moved Outside) */}
            <div className="mt-4 flex items-center gap-4 w-max max-w-[90vw] z-50" onClick={(e) => e.stopPropagation()}>
                {/* Add Card Back Pill */}
                <div className="rounded-full shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => onSelectCard({
                            id: 'generic-card-back',
                            name: 'Generic Card Back',
                            set: 'EXT',
                            collector_number: '000',
                            image_uris: {
                                normal: 'https://backs.scryfall.io/large/2/2/222b7a3b-2321-4d4c-af19-19338b134971.jpg'
                            },
                            prices: { usd: '0.00' },
                            purchase_uris: {}
                        })}
                        className="h-10 px-5 gap-2 rounded-full border"
                        style={{
                            backgroundColor: 'var(--bg-secondary)', // Use theme background
                            borderColor: 'var(--border-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <div className="w-3 h-4 bg-gray-500/50 rounded-sm border border-gray-500/50" />
                        Add Card Back
                    </Button>
                </div>

                {/* Group By Pill */}
                <div className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300 delay-50"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                >
                    <Layers className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupingOption)}
                        className="bg-transparent text-sm border-none focus:ring-0 p-1 cursor-pointer outline-none"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <option value="none">No Grouping</option>
                        <option value="promo_types">Art Style</option>
                        <option value="rarity">Rarity</option>
                        <option value="color">Color</option>
                        <option value="type">Card Type</option>
                    </select>
                </div>

                {/* Zoom Slider Pill */}
                <div className="flex items-center gap-3 p-2 px-4 rounded-full border shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300 delay-75"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                >
                    <ZoomOut className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="range"
                        min="120"
                        max="400"
                        step="10"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(Number(e.target.value))}
                        className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                        style={{ backgroundColor: 'var(--input-border)' }}
                    />
                    <ZoomIn className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
