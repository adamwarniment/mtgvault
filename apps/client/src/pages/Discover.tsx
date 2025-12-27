import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Heart, Plus, Trash2, X, ExternalLink, Book, Save, ZoomIn, ZoomOut, Layers, Menu } from 'lucide-react';
import { groupCards, type GroupingOption, SortGroupsKeys } from '../lib/cardGrouping';
import { CollapsibleSection } from '../components/ui/CollapsibleSection';
import api from '../api'; // Adjust path if needed
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Layout from '../components/Layout';

interface Wishlist {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    _count?: { cards: number };
    cards?: WishlistCard[];
}

interface WishlistCard {
    id: string;
    scryfallId: string;
    name: string;
    imageUrl: string;
    priceUsd?: number;
    set?: string;
    collectorNumber?: string;
    createdAt: string;
}

const DiscoverPage: React.FC = () => {
    // --- State ---
    // Search
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [groupBy, setGroupBy] = useState<GroupingOption>('none');

    // UI / Features
    const [zoomLevel, setZoomLevel] = useState(160);
    const [savedSearches, setSavedSearches] = useState<{ id: string, name: string, query: string }[]>([]);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newSearchName, setNewSearchName] = useState('');
    const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Wishlists
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null); // If null, we are in "Search Mode" or "Dashboard Mode"
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWishlistName, setNewWishlistName] = useState('');

    // Selection / Add to Wishlist
    const [selectedCardForAdd, setSelectedCardForAdd] = useState<any | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // --- Effects ---
    useEffect(() => {
        fetchWishlists();
        loadSavedSearches();
    }, []);

    useEffect(() => {
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

    // --- Actions ---
    const fetchWishlists = async () => {
        try {
            const res = await api.get('/wishlists');
            setWishlists(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSavedSearches = async () => {
        try {
            const response = await api.get('/saved-searches');
            setSavedSearches(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setSearching(true);
        setActiveWishlist(null); // Switch to search view
        setSearchResults([]);
        setPage(1);
        try {
            // Use existing scryfall endpoint
            let allCards: any[] = [];
            let currentPage = 1;
            let hasNext = true;

            while (hasNext) {
                const response = await api.get('/scryfall/cards', { params: { q: query, page: currentPage } });
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

            setSearchResults(allCards);
            setHasMore(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const handleLoadMore = async () => {
        if (searching || !hasMore) return;
        const nextPage = page + 1;
        try {
            const response = await api.get('/scryfall/cards', { params: { q: query, page: nextPage } });
            setSearchResults(prev => [...prev, ...response.data.data]);
            setHasMore(response.data.has_more || false);
            setPage(nextPage);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateWishlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWishlistName) return;
        try {
            const res = await api.post('/wishlists', { name: newWishlistName });
            setWishlists(prev => [res.data, ...prev]);
            setShowCreateModal(false);
            setNewWishlistName('');
            setActiveWishlist(res.data); // Switch to new list
            setIsSidebarOpen(false); // Close mobile sidebar
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteWishlist = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this wishlist?')) return;
        try {
            await api.delete(`/wishlists/${id}`);
            setWishlists(prev => prev.filter(w => w.id !== id));
            if (activeWishlist?.id === id) setActiveWishlist(null);
        } catch (error) {
            console.error(error);
        }
    };

    const loadWishlistDetails = async (list: Wishlist) => {
        setLoadingWishlist(true);
        try {
            const res = await api.get(`/wishlists/${list.id}`);
            setActiveWishlist(res.data);
            setSearchResults([]); // Clear search results to focus on list
            setQuery('');
            setIsSidebarOpen(false); // Close mobile sidebar
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const openAddToWishlistModal = (card: any) => {
        setSelectedCardForAdd(card);
        setShowAddModal(true);
    };

    const addToWishlist = async (wishlistId: string) => {
        if (!selectedCardForAdd) return;
        try {
            const cardData = {
                scryfallId: selectedCardForAdd.id,
                name: selectedCardForAdd.name,
                imageUrl: selectedCardForAdd.image_uris?.normal || selectedCardForAdd.card_faces?.[0]?.image_uris?.normal,
                set: selectedCardForAdd.set,
                collectorNumber: selectedCardForAdd.collector_number,
                priceUsd: selectedCardForAdd.prices?.usd
            };
            await api.post(`/wishlists/${wishlistId}/cards`, cardData);
            setShowAddModal(false);
            if (activeWishlist && activeWishlist.id === wishlistId) {
                loadWishlistDetails(activeWishlist);
            } else {
                fetchWishlists();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const removeCardFromWishlist = async (cardId: string) => {
        if (!activeWishlist) return;
        try {
            await api.delete(`/wishlists/${activeWishlist.id}/cards/${cardId}`);
            setActiveWishlist(prev => prev ? ({
                ...prev,
                cards: prev.cards?.filter(c => c.id !== cardId)
            }) : null);
            fetchWishlists(); // Update counts
        } catch (error) {
            console.error(error);
        }
    }

    // Saved Search Logic
    const handleSaveSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSearchName.trim()) return;
        try {
            const response = await api.post('/saved-searches', { name: newSearchName, query });
            setSavedSearches([...savedSearches, response.data]);
            setIsSaveModalOpen(false);
            setNewSearchName('');
        } catch (error) { console.error(error); }
    };

    const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/saved-searches/${id}`);
            setSavedSearches(savedSearches.filter(s => s.id !== id));
        } catch (error) { console.error(error); }
    };

    const loadSavedSearch = (savedQuery: string) => {
        setQuery(savedQuery);
        setShowSavedSearches(false);
        // Automatically trigger search
        // handleSearch(new Event('submit') as any); 
        // Can't easily construct event but effect will run? No, we need to manually trigger or let user click search.
        // User pattern usually implies clicking the saved search just populates input, or searches?
        // In SearchModal, it just setsQuery. User still has to click "Search" or we can auto-search. 
        // SearchModal: loadSavedSearch = (savedQuery) => { setQuery(savedQuery); setShowSavedSearches(false); };
        // It does NOT auto-search in modal. So we'll stick to that.
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
            setShowSavedSearches(matches.length > 0);
        } else {
            setShowSavedSearches(false);
        }
    };

    const displaySavedSearches = getFilteredSavedSearches(query);

    // --- Subcomponents ---

    const SearchResultCard = ({ card, inWishlistId }: { card: any, inWishlistId?: string }) => {
        const [isFlipped, setIsFlipped] = useState(false);
        let frontImage = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
        let backImage = card.card_faces?.[1]?.image_uris?.normal;
        const price = card.prices?.usd || card.prices?.usd_foil;

        return (
            <div className="flex flex-col gap-2 group relative">
                <div
                    className="relative w-full aspect-[63/88] rounded-lg cursor-pointer [perspective:1000px] hover:scale-105 transition-all shadow-md hover:shadow-xl"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={`w-full h-full relative transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg overflow-hidden bg-gray-800">
                            {frontImage ? <img src={frontImage} className="w-full h-full object-cover" /> : <div className="p-2 text-xs">{card.name}</div>}
                        </div>
                        {backImage && (
                            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden">
                                <img src={backImage} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Overlay Actions - Only for Search Results */}
                        {!inWishlistId && (
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openAddToWishlistModal(card); }}
                                    className="p-2 rounded-full bg-black/50 text-white hover:bg-pink-600 hover:text-white backdrop-blur-md"
                                    title="Add to Wishlist"
                                >
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Info Pill */}
                <div className="flex justify-between items-center text-sm px-1">
                    <span className="truncate flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
                    {price && <span className="text-green-400 font-mono text-xs bg-green-900/30 px-1 rounded">${price}</span>}
                </div>
            </div>
        )
    };

    const WishlistCardItem = ({ card }: { card: WishlistCard }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <div
                className="flex flex-col gap-2 group relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    className="relative w-full aspect-[63/88] rounded-lg overflow-hidden transition-all shadow-md hover:shadow-xl"
                >
                    <img src={card.imageUrl} className="w-full h-full object-cover" />
                    {isHovered && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in cursor-pointer">
                            <button
                                onClick={() => removeCardFromWishlist(card.id)}
                                className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-lg"
                                title="Remove from Wishlist"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center text-sm px-1">
                    <span className="truncate flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
                    {card.priceUsd && <span className="text-green-400 font-mono text-xs bg-green-900/30 px-1 rounded">${card.priceUsd}</span>}
                </div>
            </div>
        )
    }

    return (
        <Layout allowScroll>
            {/* Mobile Overlay for Sidebar */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex h-full">
                {/* Left Sidebar: Wishlists */}
                <div
                    className={`
                        fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col shrink-0 
                        transition-transform duration-300 ease-in-out
                        md:relative md:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    `}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                >
                    <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
                        <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Wishlists</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setShowCreateModal(true)} className="p-1 hover:bg-blue-500/10 text-blue-400 rounded transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {wishlists.map(w => (
                            <div
                                key={w.id}
                                onClick={() => loadWishlistDetails(w)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeWishlist?.id === w.id ? 'bg-blue-600/10 border border-blue-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div>
                                    <div className={`font-medium ${activeWishlist?.id === w.id ? 'text-blue-400' : 'text-gray-300'}`}>{w.name}</div>
                                    <div className="text-xs text-gray-500">{w._count?.cards || 0} cards</div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteWishlist(w.id, e)}
                                    className="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                        <Button
                            variant="success"
                            className="w-full gap-2"
                            onClick={() => { setActiveWishlist(null); setIsSidebarOpen(false); }}
                        >
                            <Search className="w-4 h-4" />
                            Card Search
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Header / Search Bar */}
                    <div className="p-6 border-b z-20 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                        {activeWishlist ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                                    >
                                        <Menu className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <span>Wishlist</span>
                                            <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                            <span>{activeWishlist.createdAt ? new Date(activeWishlist.createdAt).toLocaleDateString() : ''}</span>
                                        </div>
                                        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{activeWishlist.name}</h1>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-mono text-green-400 font-bold">
                                        {/* Calculate Total Price if desired */}
                                        ${activeWishlist.cards?.reduce((acc, c) => acc + (c.priceUsd || 0), 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Total Value</div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto">
                                <div className="relative flex items-center justify-center mb-4">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="md:hidden absolute left-0 p-2 -ml-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                                    >
                                        <Menu className="w-6 h-6" />
                                    </button>
                                    <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>Discover Cards</h1>
                                </div>
                                <form onSubmit={handleSearch} className="flex gap-2 relative z-40">
                                    {/* Syntax Guide Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowSyntaxGuide(!showSyntaxGuide)}
                                        className="w-12 h-12 flex items-center justify-center rounded-full border transition-colors hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-500 font-bold shrink-0"
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
                                            value={query}
                                            onChange={handleQueryChange}
                                            onFocus={() => {
                                                if (savedSearches.length > 0 && !query) {
                                                    // focus logic if needed
                                                }
                                            }}
                                            placeholder="Search for cards (e.g. Lotus, Sol Ring)..."
                                            className={`w-full h-12 text-lg pl-[6rem] pr-10 transition-all ${showSavedSearches ? 'rounded-b-none border-b-transparent focus:ring-0 focus:border-b-transparent z-50 relative' : ''}`}
                                            autoFocus
                                            style={{
                                                borderBottomColor: showSavedSearches ? 'transparent' : undefined,
                                                boxShadow: showSavedSearches ? 'none' : undefined
                                            }}
                                        />

                                        {/* Saved Searches Toggle (Left) */}
                                        <div className="absolute left-1 top-1 bottom-1 flex items-center z-50">
                                            <div className="relative h-full">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                                                    className={`h-full gap-1.5 text-xs px-3 hover:bg-black/10 dark:hover:bg-white/10 rounded-md ${showSavedSearches ? 'bg-black/5 dark:bg-white/5' : ''}`}
                                                    style={{ color: 'var(--text-secondary)' }}
                                                >
                                                    <Book className="w-4 h-4" />
                                                    Saved
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Save Search Button (Right) */}
                                        {query && (
                                            <div className="absolute right-1 top-1 bottom-1 flex items-center z-50">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setIsSaveModalOpen(true)}
                                                    className="h-full w-10 hover:bg-black/10 dark:hover:bg-white/10 rounded-md"
                                                    title="Save current search"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                >
                                                    <Save className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Dropdown */}
                                        {showSavedSearches && (
                                            <div className="absolute top-[calc(100%-1px)] left-0 right-0 rounded-b-lg shadow-xl border z-40 overflow-hidden animate-in fade-in slide-in-from-top-1"
                                                style={{
                                                    backgroundColor: 'var(--input-bg)',
                                                    borderColor: 'var(--border-primary)',
                                                    borderTopWidth: 0
                                                }}>
                                                <div className="max-h-60 overflow-y-auto py-1">
                                                    {displaySavedSearches.length === 0 ? (
                                                        <div className="p-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>No saved searches</div>
                                                    ) : (
                                                        displaySavedSearches.map(search => (
                                                            <div key={search.id}
                                                                onClick={() => loadSavedSearch(search.query)}
                                                                className="flex items-center justify-between px-3 py-3 hover:bg-blue-500/10 cursor-pointer group/item border-l-2 border-transparent hover:border-blue-500 transition-all"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{search.name}</p>
                                                                    <p className="text-xs truncate font-mono opacity-75" style={{ color: 'var(--text-tertiary)' }}>{search.query}</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => handleDeleteSearch(search.id, e)}
                                                                    className="p-2 rounded-md opacity-0 group-hover/item:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                                                                    title="Delete Saved Search"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0">
                                        Search
                                    </Button>
                                </form>

                                {/* Syntax Guide Embed */}
                                {showSyntaxGuide && (
                                    <div className="mt-4 rounded-xl border overflow-hidden h-96 relative bg-white animate-in slide-in-from-top-2 fade-in">
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
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth" onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                        if (activeWishlist) return;
                        if (scrollHeight - scrollTop <= clientHeight + 200 && !searching && hasMore) {
                            handleLoadMore();
                        }
                    }}>
                        {activeWishlist ? (
                            /* Wishlist View */
                            <div className="container mx-auto pb-20">
                                {loadingWishlist ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>
                                ) : activeWishlist.cards?.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">
                                        <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-xl">This wishlist is empty</p>
                                        <Button variant="ghost" className="mt-4 text-blue-400" onClick={() => setActiveWishlist(null)}>Find cards to add</Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
                                        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                    >
                                        {activeWishlist.cards?.map(card => (
                                            <WishlistCardItem key={card.id} card={card} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Search Results View */
                            <div className="container mx-auto pb-20">
                                {searching ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>
                                ) : searchResults.length > 0 ? (
                                    groupBy === 'none' ? (
                                        <div className="grid gap-6"
                                            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                        >
                                            {searchResults.map((card) => (
                                                <SearchResultCard key={card.id} card={card} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {SortGroupsKeys(Object.keys(groupCards(searchResults, groupBy)), groupBy).map(groupName => {
                                                const group = groupCards(searchResults, groupBy)[groupName];
                                                return (
                                                    <CollapsibleSection
                                                        key={groupName}
                                                        title={groupName}
                                                        count={group.length}
                                                    >
                                                        <div
                                                            className="grid gap-6 transition-all duration-200 ease-out"
                                                            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${zoomLevel}px, 1fr))` }}
                                                        >
                                                            {group.map((card) => (
                                                                <SearchResultCard key={card.id} card={card} />
                                                            ))}
                                                        </div>
                                                    </CollapsibleSection>
                                                );
                                            })}
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center py-20 text-gray-500">
                                        {query ? 'No results found.' : 'Search for cards to start discovering.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Floating Controls (Zoom + Group) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
                        {/* Group By Pill */}
                        {!activeWishlist && (
                            <div className="flex items-center gap-2 p-2 px-3 rounded-full border shadow-lg backdrop-blur-md transition-all hover:scale-105"
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
                        )}

                        <div className="flex items-center gap-3 p-2 px-4 rounded-full border shadow-lg backdrop-blur-md transition-all hover:scale-105"
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
            </div>

            {/* Create Wishlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-white">New Wishlist</h3>
                        <form onSubmit={handleCreateWishlist}>
                            <Input
                                autoFocus
                                value={newWishlistName}
                                onChange={e => setNewWishlistName(e.target.value)}
                                placeholder="e.g. Commander Staples"
                                className="mb-4 bg-gray-800 border-gray-700 text-white"
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="text-gray-400">Cancel</Button>
                                <Button type="submit" variant="success">Create</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Search Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
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

            {/* Add To Wishlist Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-2 text-white">Add to Wishlist</h3>
                        <p className="text-gray-400 text-sm mb-4">Select a wishlist for <span className="text-blue-400 font-medium">{selectedCardForAdd?.name}</span></p>

                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {wishlists.length === 0 && <p className="text-sm text-gray-500 italic">No wishlists found. Create one first!</p>}
                            {wishlists.map(w => (
                                <button
                                    key={w.id}
                                    onClick={() => addToWishlist(w.id)}
                                    className="w-full p-3 rounded-lg bg-gray-800 hover:bg-blue-600/20 hover:border-blue-500/50 border border-transparent flex items-center justify-between group transition-all"
                                >
                                    <span className="font-medium text-gray-200 group-hover:text-blue-400">{w.name}</span>
                                    <span className="text-xs text-gray-500">{w._count?.cards || 0} cards</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="text-gray-400">Cancel</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setShowCreateModal(true); }} className="text-blue-400 text-xs">
                                + Create New
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DiscoverPage;
