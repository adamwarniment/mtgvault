import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit, Save, Layers, ChevronLeft, ChevronRight, Check, Eye, EyeOff, LayoutGrid, DollarSign, RotateCw } from 'lucide-react';
import api from '../api';
import Layout from '../components/Layout';
import SearchModal from '../components/SearchModal';
import DeleteCardModal from '../components/DeleteCardModal';
import CardDetailsModal from '../components/CardDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
// import { Card, CardContent } from '../components/ui/Card';

// --- Types ---
interface CardType {
  id: string;
  scryfallId: string;
  positionIndex: number;
  imageUrl: string;
  imageUrlBack?: string;
  name: string;
  set?: string;
  collectorNumber?: string;
  priceUsd?: number;
  isPurchased: boolean;
  tcgplayerUrl?: string | null;
}

interface Binder {
  id: string;
  name: string;
  layout: 'GRID_2x2' | 'GRID_3x3' | 'GRID_4x3';
  grayOutUnpurchased: boolean;
  cards: CardType[];
}

// --- Sortable Card Component ---
const SortableCard = ({
  id,
  card,
  // index,
  isEditMode,
  onClick,
  onRemove,
  grayOutUnpurchased,
  onTogglePurchased,
  showPrices,
}: {
  id: string;
  card?: CardType;
  index: number;
  isEditMode: boolean;
  onClick: () => void;
  onRemove: () => void;
  grayOutUnpurchased: boolean;
  onTogglePurchased: (isPurchased: boolean) => void;
  showPrices: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode || !card });

  const [isFlipped, setIsFlipped] = React.useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Separate handlers for delete to prevent drag
  const handleDeleteMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove();
  };

  const handleDeleteTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove();
  };

  const handleTogglePurchased = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card) {
      onTogglePurchased(!card.isPurchased);
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const isGrayedOut = card && !card.isPurchased && grayOutUnpurchased;
  const hasBack = !!card?.imageUrlBack;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[63/88] rounded-lg border-2 group touch-manipulation [perspective:1000px] ${isEditMode && card ? 'cursor-grab active:cursor-grabbing touch-none' : ''
        } ${!card
          ? 'border-dashed border-yellow-900/30 hover:border-yellow-600/50 flex items-center justify-center cursor-pointer bg-gradient-to-br from-yellow-50/5 to-yellow-100/5 hover:from-yellow-50/10 hover:to-yellow-100/10'
          : 'border-yellow-900/20 hover:border-yellow-600/40 shadow-md'
        }`}
      onClick={!isEditMode ? onClick : undefined}
      {...(isEditMode && card ? { ...attributes, ...listeners } : {})}
    >
      {card ? (
        <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            <div className="w-full h-full overflow-hidden rounded-md relative">
              <img
                src={card.imageUrl}
                alt={card.name}
                className={`w-full h-full object-cover transition-all duration-300 ${isGrayedOut ? 'grayscale brightness-75' : ''}`}
              />
            </div>
          </div>

          {/* Back Face */}
          {hasBack && (
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="w-full h-full overflow-hidden rounded-md relative">
                <img
                  src={card.imageUrlBack}
                  alt={card.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${isGrayedOut ? 'grayscale brightness-75' : ''}`}
                />
              </div>
            </div>
          )}

          {/* Overlays (Visible on top of everything, not rotating with the card face content? 
              Actually if they are outside the flipping container they won't rotate. 
              But I put them inside the main div which is the perspective container. 
              The flipping happens on the div carrying [transform-style:preserve-3d].
              So if I put overlays outside the flipping div they will stay static.
          */}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="w-8 h-8 rounded-full bg-yellow-900/20 group-hover:bg-yellow-600/30 flex items-center justify-center transition-all">
            <Plus className="w-4 h-4 text-yellow-900/40 group-hover:text-yellow-600/60 transition-colors" />
          </div>
          <p className="text-[10px] text-yellow-900/40 group-hover:text-yellow-600/60 transition-colors">Add Card</p>
        </div>
      )}

      {/* Static Overlays (Checkboxes, Trash, etc) - These sit on top of the flipping container */}
      {card && (
        <>
          {/* Flip Button */}
          {hasBack && !isEditMode && (
            <div className="absolute top-2 left-2 z-30">
              <button
                onClick={handleFlip}
                className="bg-black/20 hover:bg-black/60 text-white/50 hover:text-white p-1.5 rounded-full transition-all border border-white/10 hover:border-white/30"
                title="Flip Card"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Purchased Checkbox Overlay */}
          {!isEditMode && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${card.isPurchased
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-black/50 border-white/50 hover:bg-black/70'
                  }`}
                onClick={handleTogglePurchased}
              >
                {card.isPurchased && <Check className="w-4 h-4" />}
              </div>
            </div>
          )}

          {isEditMode && (
            <button
              onMouseDown={handleDeleteMouseDown}
              onTouchStart={handleDeleteTouchStart}
              className="absolute top-1 right-1 bg-red-600/90 text-white p-1.5 rounded-full hover:bg-red-700 shadow-xl z-50 transition-all hover:scale-110 backdrop-blur-sm"
              style={{ pointerEvents: 'auto' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {!isEditMode && (
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity flex flex-col justify-end p-2 pointer-events-none rounded-lg ${showPrices ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div className="flex justify-between items-end w-full">
                <p className="text-white text-xs font-medium truncate flex-1 mr-1">{card.name}</p>
                {card.priceUsd && (
                  <span className="text-green-400 text-xs font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded">
                    ${card.priceUsd.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- Main Binder View Component ---
const BinderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [binder, setBinder] = useState<Binder | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replacementMode, setReplacementMode] = useState<'SWAP' | 'INSERT'>('SWAP');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ cardId: string; cardName: string } | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeleteBinderConfirm, setShowDeleteBinderConfirm] = useState(false);

  // State for mobile/single-view detection (increased breakpoint for better portrait tablet support)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Dynamic Sizing Logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [binder]);

  useEffect(() => {
    fetchBinder();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if interacting with inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (!binder) return;

      // Card Detail View Navigation
      if (selectedCard) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          // Sort cards by position to ensure sequential order
          const sortedCards = [...binder.cards].sort((a, b) => a.positionIndex - b.positionIndex);
          const currentIndex = sortedCards.findIndex(c => c.id === selectedCard.id);

          if (currentIndex === -1) return;

          if (e.key === 'ArrowRight' && currentIndex < sortedCards.length - 1) {
            e.preventDefault();
            setSelectedCard(sortedCards[currentIndex + 1]);
          } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            e.preventDefault();
            setSelectedCard(sortedCards[currentIndex - 1]);
          }
        }
        return;
      }

      // Binder Page Navigation
      // Only navigate if no other modals are open
      if (!showSearch && !deleteConfirm && !showDeleteBinderConfirm) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          // Re-calculate total pages logic since it's defined after the early return in render
          const getGridSize = () => {
            switch (binder.layout) {
              case 'GRID_2x2': return 4;
              case 'GRID_4x3': return 12;
              case 'GRID_3x3': default: return 9;
            }
          };

          const pageSize = getGridSize();
          const totalSlots = Math.max(
            Math.ceil((Math.max(...binder.cards.map((c) => c.positionIndex), -1) + 1) / pageSize) * pageSize,
            pageSize * 2 // At least 2 pages
          );

          const cardsPerView = pageSize * (isMobile ? 1 : 2);
          const totalViews = Math.ceil(totalSlots / cardsPerView);

          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setCurrentPage(prev => Math.min(totalViews - 1, prev + 1));
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setCurrentPage(prev => Math.max(0, prev - 1));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [binder, selectedCard, showSearch, deleteConfirm, showDeleteBinderConfirm, isMobile]);

  const fetchBinder = async () => {
    try {
      const response = await api.get(`/binders/${id}`);
      setBinder(response.data);
    } catch (error) {
      console.error('Failed to fetch binder');
    }
  };

  const handleAddCard = async (scryfallCard: any) => {
    if (!binder || selectedSlot === null) return;

    try {
      let imageUrl = scryfallCard.image_uris?.normal || '';
      let imageUrlBack = '';

      // Handle double-sided cards
      if (!imageUrl && scryfallCard.card_faces && scryfallCard.card_faces.length === 2) {
        imageUrl = scryfallCard.card_faces[0].image_uris?.normal || '';
        imageUrlBack = scryfallCard.card_faces[1].image_uris?.normal || '';
      }

      let tcgplayerUrl = null;
      if (scryfallCard.purchase_uris?.tcgplayer) {
        const rawUrl = scryfallCard.purchase_uris.tcgplayer;
        try {
          const uParam = new URLSearchParams(rawUrl.split('?')[1]).get('u');
          if (uParam) {
            tcgplayerUrl = decodeURIComponent(uParam).split('?')[0];
          } else {
            tcgplayerUrl = rawUrl.split('?')[0];
          }
        } catch (e) {
          console.warn('Failed to parse TCGPlayer URL', e);
        }
      }

      await api.post(`/binders/${binder.id}/cards`, {
        scryfallId: scryfallCard.id,
        positionIndex: selectedSlot,
        imageUrl,
        imageUrlBack: imageUrlBack || undefined,
        name: scryfallCard.name,
        set: scryfallCard.set,
        collectorNumber: scryfallCard.collector_number,
        priceUsd: scryfallCard.prices?.usd
          ? parseFloat(scryfallCard.prices.usd)
          : scryfallCard.prices?.usd_foil
            ? parseFloat(scryfallCard.prices.usd_foil)
            : scryfallCard.prices?.usd_etched
              ? parseFloat(scryfallCard.prices.usd_etched)
              : null,
        isPurchased: true,
        tcgplayerUrl,
      });

      if (bulkMode) {
        // Show notification
        toast('Card added!', 'success', 2000);

        // Calculate next empty slot
        const occupiedIndices = new Set(binder.cards.map(c => c.positionIndex));
        occupiedIndices.add(selectedSlot); // Add the one we just filled

        let nextSlot = selectedSlot + 1;
        while (occupiedIndices.has(nextSlot)) {
          nextSlot++;
        }
        setSelectedSlot(nextSlot);
      } else {
        setShowSearch(false);
      }

      fetchBinder();
    } catch (error) {
      console.error('Failed to add card');
    }
  };

  const handleBulkAddClick = () => {
    if (!binder) return;

    // Find first empty slot
    const occupiedIndices = new Set(binder.cards.map(c => c.positionIndex));
    let firstEmptySlot = 0;
    while (occupiedIndices.has(firstEmptySlot)) {
      firstEmptySlot++;
    }

    setSelectedSlot(firstEmptySlot);
    setBulkMode(true);
    setShowSearch(true);
  };

  const handleRemoveCard = async (cardId: string, cardName: string) => {
    if (!binder) return;
    setDeleteConfirm({ cardId, cardName });
  };

  const confirmRemoveCard = async (shiftCards: boolean) => {
    if (!binder || !deleteConfirm) return;

    try {
      // Delete the card
      await api.delete(`/binders/${binder.id}/cards/${deleteConfirm.cardId}`);

      // If shift mode, reorder all cards after the deleted position
      if (shiftCards) {
        const deletedCard = binder.cards.find(c => c.id === deleteConfirm.cardId);
        if (deletedCard) {
          const cardsToShift = binder.cards.filter(
            c => c.positionIndex > deletedCard.positionIndex
          );

          if (cardsToShift.length > 0) {
            const moves = cardsToShift.map(c => ({
              cardId: c.id,
              newPosition: c.positionIndex - 1
            }));

            await api.put(`/binders/${binder.id}/reorder`, { moves });
          }
        }
      }

      setDeleteConfirm(null);
      fetchBinder();
    } catch (error) {
      console.error('Failed to remove card');
      setDeleteConfirm(null);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !binder) return;

    const oldIndex = parseInt(active.id.split('-')[1]);
    const newIndex = parseInt(over.id.split('-')[1]);

    console.log('Drag from', oldIndex, 'to', newIndex);

    const newCards = [...binder.cards];
    const activeCard = newCards.find((c) => c.positionIndex === oldIndex);

    if (!activeCard) {
      console.log('No active card found at position', oldIndex);
      return;
    }

    const overCard = newCards.find((c) => c.positionIndex === newIndex);

    // Handle based on replacement mode
    if (replacementMode === 'INSERT') {
      // Shift logic (Rotation)
      if (oldIndex < newIndex) {
        // Moving Down: Shift items in (oldIndex, newIndex] UP by -1
        newCards.forEach(c => {
          if (c.positionIndex > oldIndex && c.positionIndex <= newIndex) {
            c.positionIndex -= 1;
          }
        });
      } else {
        // Moving Up: Shift items in [newIndex, oldIndex) DOWN by +1
        newCards.forEach(c => {
          if (c.positionIndex >= newIndex && c.positionIndex < oldIndex) {
            c.positionIndex += 1;
          }
        });
      }
      activeCard.positionIndex = newIndex;
    } else {
      // SWAP logic (Default)
      activeCard.positionIndex = newIndex;
      if (overCard) {
        overCard.positionIndex = oldIndex;
      }
    }

    // Optimistic update
    setBinder({ ...binder, cards: newCards });

    try {
      const moves = newCards.map(c => ({ cardId: c.id, newPosition: c.positionIndex }));
      console.log('Sending reorder request:', moves);
      await api.put(`/binders/${binder.id}/reorder`, { moves });
    } catch (error: any) {
      console.error("Failed to save order:", error.response?.data || error.message);
      // Revert on error
      fetchBinder();
    }
  };

  const handleRefreshPrice = async () => {
    if (!binder || !selectedCard) return;

    try {
      const response = await api.put(`/binders/${binder.id}/cards/${selectedCard.id}/refresh-price`);
      const updatedCard = response.data;

      // Update local state
      const newCards = binder.cards.map(c => c.id === updatedCard.id ? { ...c, priceUsd: updatedCard.priceUsd, tcgplayerUrl: updatedCard.tcgplayerUrl } : c);
      setBinder({ ...binder, cards: newCards });
      setSelectedCard({ ...selectedCard, priceUsd: updatedCard.priceUsd, tcgplayerUrl: updatedCard.tcgplayerUrl });
    } catch (error) {
      console.error('Failed to refresh price');
    }
  };

  const handleTogglePurchased = async (cardId: string, isPurchased: boolean) => {
    if (!binder) return;

    // Optimistic update
    const newCards = binder.cards.map(c => c.id === cardId ? { ...c, isPurchased } : c);
    setBinder({ ...binder, cards: newCards });

    // Also update selected card if it's the one being toggled
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard({ ...selectedCard, isPurchased });
    }

    try {
      await api.put(`/binders/${binder.id}/cards/${cardId}/purchased`, { isPurchased });
    } catch (error) {
      console.error('Failed to toggle purchased status');
      fetchBinder(); // Revert
    }
  };

  const handleToggleGrayOut = async (grayOutUnpurchased: boolean) => {
    if (!binder) return;

    // Optimistic update
    setBinder({ ...binder, grayOutUnpurchased });

    try {
      await api.put(`/binders/${binder.id}/settings`, { grayOutUnpurchased });
    } catch (error) {
      console.error('Failed to update binder settings');
      fetchBinder(); // Revert
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!binder) return;
    setBinder({ ...binder, name: e.target.value });
  };

  const handleNameBlur = async () => {
    if (!binder) return;
    try {
      await api.put(`/binders/${binder.id}`, { name: binder.name });
      toast('Binder renamed', 'success');
    } catch (error) {
      console.error('Failed to rename binder');
      toast('Failed to rename binder', 'error');
    }
  };

  const handleDeleteBinder = async () => {
    if (!binder) return;
    try {
      await api.delete(`/binders/${binder.id}`);
      toast('Binder deleted', 'success');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete binder');
      toast('Failed to delete binder', 'error');
    }
  };

  if (!binder) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-600 animate-pulse" />
          </div>
          <p className="text-gray-400">Loading binder...</p>
        </div>
      </div>
    </Layout>
  );

  const getGridSize = () => {
    switch (binder.layout) {
      case 'GRID_2x2': return 4;
      case 'GRID_4x3': return 12;
      case 'GRID_3x3': default: return 9;
    }
  };

  const totalValue = binder.cards.reduce((sum, card) => sum + (card.priceUsd || 0), 0);
  const purchasedValue = binder.cards
    .filter(card => card.isPurchased)
    .reduce((sum, card) => sum + (card.priceUsd || 0), 0);
  const missingValue = totalValue - purchasedValue;

  const pageSize = getGridSize();
  const totalSlots = Math.max(
    Math.ceil((Math.max(...binder.cards.map((c) => c.positionIndex), -1) + 1) / pageSize) * pageSize,
    pageSize * 2 // At least 2 pages
  );

  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const card = binder.cards.find((c) => c.positionIndex === i);
    return { id: `slot-${i}`, index: i, card };
  });

  // Calculate pages/views based on mobile state
  // On Desktop: View = Spread (2 pages). On Mobile: View = Single Page.
  const cardsPerView = pageSize * (isMobile ? 1 : 2);
  const totalViews = Math.ceil(slots.length / cardsPerView);

  // Get current view slots
  const currentViewStart = currentPage * cardsPerView;
  const currentViewSlots = slots.slice(currentViewStart, currentViewStart + cardsPerView);

  // For Desktop render, split into left/right pages
  const leftPageSlots = isMobile ? [] : currentViewSlots.slice(0, pageSize);
  const rightPageSlots = isMobile ? [] : currentViewSlots.slice(pageSize, pageSize * 2);

  const getGridCols = () => {
    switch (binder.layout) {
      case 'GRID_2x2': return 'grid-cols-2';
      case 'GRID_4x3': return 'grid-cols-4';
      case 'GRID_3x3': default: return 'grid-cols-3';
    }
  };

  const getAspectRatio = () => {
    // Card ratio ~0.716 (63/88)
    const cardRatio = 63 / 88;
    let baseRatio = 0.716;

    switch (binder.layout) {
      case 'GRID_2x2': baseRatio = (2 / 2) * cardRatio; break;
      case 'GRID_4x3': baseRatio = (4 / 3) * cardRatio; break;
      case 'GRID_3x3': default: baseRatio = (3 / 3) * cardRatio; break;
    }

    // Adjust for spread view (2 pages) vs single view
    return isMobile ? baseRatio : baseRatio * 2.02; // 2.02 to account for gap
  };

  const getAspectStyle = () => {
    const ratio = getAspectRatio();
    const containerRatio = containerSize.width / containerSize.height;

    // If container is wider than binder: limiting factor is height -> h-full
    // If binder is wider than container: limiting factor is width -> w-full
    // We default to w-full if measurement isn't ready

    // Default mobile behavior (portrait) often prefers height to fit if tall screen, width if wide.
    // The logic holds for both: maximize size within box.

    // However, specifically on mobile, existing logic was 'h-full w-auto'.
    // If we rely purely on ratio comparison, it should be correct.

    if (!containerSize.width || !containerSize.height) return { aspectRatio: ratio, width: '100%' };

    const isContainerWider = containerRatio > ratio;

    return {
      aspectRatio: ratio,
      width: isContainerWider ? 'auto' : '100%',
      height: isContainerWider ? '100%' : 'auto',
    };
  };

  return (
    <Layout>
      <div className="h-full flex flex-col xl:flex-row py-2 px-2 md:py-4 md:px-4 overflow-hidden max-h-full">

        {/* Header / Sidebar (Landscape) */}
        <div className="mb-4 flex-shrink-0 xl:mb-0 xl:w-56 xl:h-full xl:flex xl:flex-col xl:justify-center xl:mr-4 xl:border-r xl:border-gray-800/50 xl:pr-4 xl:overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start gap-2 mb-2 xl:flex-col xl:items-center xl:w-full xl:mb-6 xl:gap-4">
            {isEditMode ? (
              <Input
                value={binder.name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="text-2xl font-bold text-white mb-1 xl:text-center xl:mb-2 !bg-white/5 !border-white/10 hover:!border-purple-500/50 focus:!border-purple-500 focus:ring-2 focus:ring-purple-500/50 rounded-xl px-4 h-auto w-full text-center transition-all shadow-inner"
                placeholder="Binder Name"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white mb-1 xl:text-center xl:mb-2">{binder.name}</h1>
            )}

            <div className="flex items-center gap-2 xl:justify-center xl:flex-wrap xl:gap-3">
              {/* Bulk Add Button */}
              <Button
                onClick={handleBulkAddClick}
                variant="outline"
                size="icon"
                className="w-10 h-10 text-purple-400 bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20"
                title="Bulk Add Cards"
              >
                <LayoutGrid className="w-5 h-5" />
              </Button>

              {/* Gray Out Setting */}
              <Button
                onClick={() => handleToggleGrayOut(!binder.grayOutUnpurchased)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 transition-all ${binder.grayOutUnpurchased ? 'text-gray-400 bg-gray-800/50' : 'text-purple-400 bg-purple-500/10 border-purple-500/50'}`}
                title={binder.grayOutUnpurchased ? "Show all in color" : "Gray out unpurchased"}
              >
                {binder.grayOutUnpurchased ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>

              {/* Show Prices Toggle */}
              <Button
                onClick={() => setShowPrices(!showPrices)}
                variant="outline"
                size="icon"
                className={`w-10 h-10 transition-all ${!showPrices ? 'text-gray-400 bg-gray-800/50' : 'text-green-400 bg-green-500/10 border-green-500/50'}`}
                title={showPrices ? "Hide Prices" : "Show Prices"}
              >
                <DollarSign className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant={isEditMode ? "default" : "outline"}
                size="icon"
                className="w-10 h-10"
                title={isEditMode ? "Finish Editing" : "Edit Binder"}
              >
                {isEditMode ? (
                  <Save className="w-5 h-5" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 h-8 xl:h-auto xl:w-full xl:flex-col xl:items-stretch xl:gap-6">
            {isEditMode ? (
              // EDIT MODE CONTROLS (Replaces Stats)
              <div className="flex items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-200 xl:flex-col xl:items-center xl:text-center xl:gap-3">
                <span className="text-sm font-medium text-gray-300">Drag Mode</span>
                <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700/50">
                  <button
                    onClick={() => setReplacementMode('SWAP')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${replacementMode === 'SWAP'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Swap
                  </button>
                  <button
                    onClick={() => setReplacementMode('INSERT')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${replacementMode === 'INSERT'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Insert
                  </button>
                </div>
                <span className="text-xs text-gray-500 hidden sm:inline xl:inline ml-auto xl:ml-0">
                  {replacementMode === 'SWAP' ? 'Swap positions' : 'Shift others'}
                </span>

                <div className="w-full h-px bg-gray-800 my-1" />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteBinderConfirm(true)}
                  className="w-full gap-2 shadow-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Binder
                </Button>
              </div>
            ) : (
              // NORMAL STATS
              <div className="w-full flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200 xl:flex-col xl:items-center xl:gap-3">
                <div className="flex items-center gap-4 xl:flex-col xl:gap-1">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {binder.cards.length} cards
                  </span>
                </div>

                <span className="w-px h-6 bg-gray-700 mx-1 hidden md:block xl:hidden" />
                <div className="w-full h-px bg-gray-800 my-1 hidden xl:block" />

                <div className="flex items-center gap-2 ml-auto md:ml-0 xl:w-full xl:flex-col xl:gap-3">
                  {/* Total Value Pill */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/40 border border-gray-700/50 rounded-full shadow-inner xl:w-full xl:justify-center">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider hidden sm:inline xl:inline">Total</span>
                    <span className="text-white font-mono font-bold">
                      ${totalValue.toFixed(2)}
                    </span>
                  </div>

                  {/* Purchased & Missing Breakdown */}
                  <div className="flex items-center rounded-full bg-gray-900/40 border border-gray-700/50 overflow-hidden shadow-inner xl:w-full xl:justify-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 border-r border-gray-700/50 bg-green-500/5 xl:flex-1 xl:justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      <span className="text-green-400 font-mono text-xs font-medium">
                        ${purchasedValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/5 xl:flex-1 xl:justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <span className="text-red-400 font-mono text-xs font-medium">
                        ${missingValue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Landscape Navigation (Sidebar) */}
          <div className="hidden xl:flex w-full justify-center mt-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="flex items-center gap-2 bg-gray-900/40 p-1 rounded-full border border-gray-700/50 shadow-inner">
              <Button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white hover:bg-white/10 hover:text-purple-400 transition-colors"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs font-medium text-gray-400 tabular-nums px-2 min-w-[3rem] text-center">Page {currentPage + 1}/{totalViews}</span>
              <Button onClick={() => setCurrentPage(Math.min(totalViews - 1, currentPage + 1))} disabled={currentPage >= totalViews - 1} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white hover:bg-white/10 hover:text-purple-400 transition-colors"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Binder Spread Container */}
        <div ref={containerRef} className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Binder Pages */}
          <div
            className={`flex gap-1 justify-center items-center mx-auto transition-all duration-300 shadow-2xl rounded-2xl ${!containerSize.width ? 'opacity-0' : 'opacity-100'
              }`}
            style={getAspectStyle()}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveId(event.active.id as string)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={slots.map((s) => s.id)} strategy={rectSortingStrategy}>
                {isMobile ? (
                  // Mobile Single Page View
                  <div
                    className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 border-2 border-gray-700 w-full h-full flex flex-col justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.02] to-transparent rounded-2xl pointer-events-none"></div>
                    <div className={`grid ${getGridCols()} relative z-10`}>
                      {currentViewSlots.map((slot) => (
                        <SortableCard
                          key={slot.id}
                          id={slot.id}
                          index={slot.index}
                          card={slot.card}
                          isEditMode={isEditMode}
                          onClick={() => {
                            if (slot.card) {
                              setSelectedCard(slot.card);
                            } else {
                              setSelectedSlot(slot.index);
                              setBulkMode(false);
                              setShowSearch(true);
                            }
                          }}
                          onRemove={() => slot.card && handleRemoveCard(slot.card.id, slot.card.name)}
                          grayOutUnpurchased={binder.grayOutUnpurchased}
                          showPrices={showPrices}
                          onTogglePurchased={(isPurchased) => slot.card && handleTogglePurchased(slot.card.id, isPurchased)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Desktop Spread View
                  <>
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-l-2xl shadow-2xl p-6 border-2 border-r-0 border-gray-700 w-full h-full flex flex-col justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.02] to-transparent rounded-l-2xl pointer-events-none"></div>

                      <div className={`grid ${getGridCols()} gap-2 h-full content-center relative z-10`}>
                        {leftPageSlots.map((slot) => (
                          <SortableCard
                            key={slot.id}
                            id={slot.id}
                            index={slot.index}
                            card={slot.card}
                            isEditMode={isEditMode}
                            onClick={() => {
                              if (slot.card) {
                                setSelectedCard(slot.card);
                              } else {
                                setSelectedSlot(slot.index);
                                setBulkMode(false);
                                setShowSearch(true);
                              }
                            }}
                            onRemove={() => slot.card && handleRemoveCard(slot.card.id, slot.card.name)}
                            grayOutUnpurchased={binder.grayOutUnpurchased}
                            showPrices={showPrices}
                            onTogglePurchased={(isPurchased) => slot.card && handleTogglePurchased(slot.card.id, isPurchased)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="w-px bg-gray-600"></div>

                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-r-2xl shadow-2xl p-6 border-2 border-l-0 border-gray-700 w-full h-full flex flex-col justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.02] to-transparent rounded-r-2xl pointer-events-none"></div>

                      <div className={`grid ${getGridCols()} gap-2 h-full content-center relative z-10`}>
                        {rightPageSlots.map((slot) => (
                          <SortableCard
                            key={slot.id}
                            id={slot.id}
                            index={slot.index}
                            card={slot.card}
                            isEditMode={isEditMode}
                            onClick={() => {
                              if (slot.card) {
                                setSelectedCard(slot.card);
                              } else {
                                setSelectedSlot(slot.index);
                                setBulkMode(false);
                                setShowSearch(true);
                              }
                            }}
                            onRemove={() => slot.card && handleRemoveCard(slot.card.id, slot.card.name)}
                            grayOutUnpurchased={binder.grayOutUnpurchased}
                            showPrices={showPrices}
                            onTogglePurchased={(isPurchased) => slot.card && handleTogglePurchased(slot.card.id, isPurchased)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="aspect-[63/88] rounded-lg border-2 border-purple-500 overflow-hidden shadow-2xl shadow-purple-500/50 opacity-90"
                    style={{ width: '150px' }}>
                    {(() => {
                      const index = parseInt(activeId.split('-')[1]);
                      const card = binder.cards.find(c => c.positionIndex === index);
                      return card ? <img src={card.imageUrl} className="w-full h-full object-cover" alt={card.name} /> : null;
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Portrait Navigation (Bottom) */}
        <div className="xl:hidden flex justify-center mt-3 mb-1 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 z-20">
          <div className="flex items-center gap-4 bg-gray-900/60 backdrop-blur-md p-1.5 rounded-full border border-gray-700/50 shadow-xl ring-1 ring-white/5">
            <Button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} variant="ghost" size="icon" className="w-10 h-10 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all"><ChevronLeft className="w-6 h-6" /></Button>
            <span className="text-sm font-medium text-gray-200 tabular-nums px-2 min-w-[5rem] text-center">Page {currentPage + 1} of {totalViews}</span>
            <Button onClick={() => setCurrentPage(Math.min(totalViews - 1, currentPage + 1))} disabled={currentPage >= totalViews - 1} variant="ghost" size="icon" className="w-10 h-10 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all"><ChevronRight className="w-6 h-6" /></Button>
          </div>
        </div>

        <SearchModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectCard={handleAddCard}
        />

        <DeleteCardModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmRemoveCard}
          cardName={deleteConfirm?.cardName || ''}
        />

        <ConfirmDialog
          isOpen={showDeleteBinderConfirm}
          onCancel={() => setShowDeleteBinderConfirm(false)}
          onConfirm={handleDeleteBinder}
          title="Delete Binder"
          message={`Are you sure you want to delete "${binder.name}"? This action cannot be undone and all cards inside will be lost from this binder view.`}
          confirmText="Delete Binder"
          variant="danger"
        />

        <CardDetailsModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onRefresh={handleRefreshPrice}
          onTogglePurchased={(isPurchased) => selectedCard && handleTogglePurchased(selectedCard.id, isPurchased)}
        />
      </div>
    </Layout>
  );
};

export default BinderView;
