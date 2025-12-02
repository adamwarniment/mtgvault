import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { Plus, Trash2, Edit, Save, Layers, ChevronLeft, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import Layout from '../components/Layout';
import SearchModal from '../components/SearchModal';
import DeleteCardModal from '../components/DeleteCardModal';
import CardDetailsModal from '../components/CardDetailsModal';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';

// --- Types ---
interface CardType {
  id: string;
  scryfallId: string;
  positionIndex: number;
  imageUrl: string;
  name: string;
  set?: string;
  collectorNumber?: string;
  priceUsd?: number;
  isPurchased: boolean;
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
  index,
  isEditMode,
  onClick,
  onRemove,
  grayOutUnpurchased,
  onTogglePurchased,
}: {
  id: string;
  card?: CardType;
  index: number;
  isEditMode: boolean;
  onClick: () => void;
  onRemove: () => void;
  grayOutUnpurchased: boolean;
  onTogglePurchased: (isPurchased: boolean) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode || !card });

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

  const isGrayedOut = card && !card.isPurchased && grayOutUnpurchased;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-[63/88] rounded-lg border-2 transition-all group ${isEditMode && card ? 'cursor-grab active:cursor-grabbing' : ''
        } ${!card
          ? 'border-dashed border-yellow-900/30 hover:border-yellow-600/50 flex items-center justify-center cursor-pointer bg-gradient-to-br from-yellow-50/5 to-yellow-100/5 hover:from-yellow-50/10 hover:to-yellow-100/10'
          : 'border-yellow-900/20 hover:border-yellow-600/40 shadow-md'
        }`}
      onClick={!isEditMode ? onClick : undefined}
      {...(isEditMode && card ? { ...attributes, ...listeners } : {})}
    >
      {card ? (
        <>
          <div className="w-full h-full overflow-hidden rounded-md relative">
            <img
              src={card.imageUrl}
              alt={card.name}
              className={`w-full h-full object-cover transition-all duration-300 ${isGrayedOut ? 'grayscale brightness-75' : ''}`}
            />
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
          </div>
          {isEditMode && (
            <button
              onMouseDown={handleDeleteMouseDown}
              onTouchStart={handleDeleteTouchStart}
              className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-xl z-50 transition-all hover:scale-110"
              style={{ pointerEvents: 'auto' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isEditMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pointer-events-none">
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
      ) : (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="w-8 h-8 rounded-full bg-yellow-900/20 group-hover:bg-yellow-600/30 flex items-center justify-center transition-all">
            <Plus className="w-4 h-4 text-yellow-900/40 group-hover:text-yellow-600/60 transition-colors" />
          </div>
          <p className="text-[10px] text-yellow-900/40 group-hover:text-yellow-600/60 transition-colors">Add Card</p>
        </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBinder();
  }, [id]);

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
      await api.post(`/binders/${binder.id}/cards`, {
        scryfallId: scryfallCard.id,
        positionIndex: selectedSlot,
        imageUrl: scryfallCard.image_uris?.normal || '',
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
      });
      setShowSearch(false);
      fetchBinder();
    } catch (error) {
      console.error('Failed to add card');
    }
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

    // Swap positions
    activeCard.positionIndex = newIndex;
    if (overCard) {
      overCard.positionIndex = oldIndex;
    }

    // Optimistic update
    setBinder({ ...binder, cards: newCards });

    try {
      const moves = newCards.map(c => ({ cardId: c.id, newPosition: c.positionIndex }));
      console.log('Sending reorder request:', moves);
      const response = await api.put(`/binders/${binder.id}/reorder`, { moves });
      console.log('Reorder response:', response.status);
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
      const newCards = binder.cards.map(c => c.id === updatedCard.id ? { ...c, priceUsd: updatedCard.priceUsd } : c);
      setBinder({ ...binder, cards: newCards });
      setSelectedCard({ ...selectedCard, priceUsd: updatedCard.priceUsd });
    } catch (error) {
      console.error('Failed to refresh price');
    }
  };

  const handleTogglePurchased = async (cardId: string, isPurchased: boolean) => {
    if (!binder) return;

    // Optimistic update
    const newCards = binder.cards.map(c => c.id === cardId ? { ...c, isPurchased } : c);
    setBinder({ ...binder, cards: newCards });

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

  const pageSize = getGridSize();
  const totalSlots = Math.max(
    Math.ceil((Math.max(...binder.cards.map((c) => c.positionIndex), -1) + 1) / pageSize) * pageSize,
    pageSize * 2 // At least 2 pages
  );

  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const card = binder.cards.find((c) => c.positionIndex === i);
    return { id: `slot-${i}`, index: i, card };
  });

  // Calculate pages - each spread shows 2 pages
  const totalPages = Math.ceil(totalSlots / pageSize);
  const totalSpreads = Math.ceil(totalPages / 2);

  // Get slots for current spread (2 pages)
  const leftPageStart = currentPage * pageSize * 2;
  const leftPageSlots = slots.slice(leftPageStart, leftPageStart + pageSize);
  const rightPageSlots = slots.slice(leftPageStart + pageSize, leftPageStart + pageSize * 2);

  const getGridCols = () => {
    switch (binder.layout) {
      case 'GRID_2x2': return 'grid-cols-2';
      case 'GRID_4x3': return 'grid-cols-4';
      case 'GRID_3x3': default: return 'grid-cols-3';
    }
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col py-4 px-4">

        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{binder.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {binder.cards.length} cards
                </span>
                <span>Page {currentPage + 1} of {totalSpreads}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Gray Out Setting */}
              <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                <Switch
                  checked={binder.grayOutUnpurchased}
                  onCheckedChange={handleToggleGrayOut}
                  id="gray-out-mode"
                />
                <label htmlFor="gray-out-mode" className="text-sm text-gray-300 cursor-pointer select-none flex items-center gap-2">
                  {binder.grayOutUnpurchased ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Gray out unpurchased
                </label>
              </div>

              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant={isEditMode ? "default" : "outline"}
                className="gap-2"
              >
                {isEditMode ? (
                  <>
                    <Save className="w-4 h-4" />
                    Done Editing
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Binder
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <Card className="mb-4 border-purple-500/50 bg-purple-500/5 flex-shrink-0">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-300">Drag Mode:</span>
                  <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setReplacementMode('SWAP')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${replacementMode === 'SWAP'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Swap
                    </button>
                    <button
                      onClick={() => setReplacementMode('INSERT')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${replacementMode === 'INSERT'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Insert
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {replacementMode === 'SWAP' ? 'Cards swap places' : 'Cards shift to make room'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Binder Spread Container */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Page Navigation */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              onClick={() => setCurrentPage(Math.min(totalSpreads - 1, currentPage + 1))}
              disabled={currentPage >= totalSpreads - 1}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Binder Pages */}
          <div className="flex gap-1 justify-center perspective-1000">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveId(event.active.id as string)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={slots.map((s) => s.id)} strategy={rectSortingStrategy}>
                {/* Left Page */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-l-2xl shadow-2xl p-6 border-2 border-r-0 border-gray-700"
                  style={{ width: '450px' }}>
                  {/* Page texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.02] to-transparent rounded-l-2xl pointer-events-none"></div>



                  <div className={`grid ${getGridCols()} gap-2 relative z-10`}>
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
                            setShowSearch(true);
                          }
                        }}
                        onRemove={() => slot.card && handleRemoveCard(slot.card.id, slot.card.name)}
                        grayOutUnpurchased={binder.grayOutUnpurchased}
                        onTogglePurchased={(isPurchased) => slot.card && handleTogglePurchased(slot.card.id, isPurchased)}
                      />
                    ))}
                  </div>
                </div>

                {/* Spine/Binding */}
                <div className="w-px bg-gray-600"></div>

                {/* Right Page */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-r-2xl shadow-2xl p-6 border-2 border-l-0 border-gray-700"
                  style={{ width: '450px' }}>
                  {/* Page texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.02] to-transparent rounded-r-2xl pointer-events-none"></div>



                  <div className={`grid ${getGridCols()} gap-2 relative z-10`}>
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
                            setShowSearch(true);
                          }
                        }}
                        onRemove={() => slot.card && handleRemoveCard(slot.card.id, slot.card.name)}
                        grayOutUnpurchased={binder.grayOutUnpurchased}
                        onTogglePurchased={(isPurchased) => slot.card && handleTogglePurchased(slot.card.id, isPurchased)}
                      />
                    ))}
                  </div>
                </div>
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

        <SearchModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectCard={handleAddCard}
        />

        <CardDetailsModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onRefresh={handleRefreshPrice}
        />

        <DeleteCardModal
          isOpen={!!deleteConfirm}
          cardName={deleteConfirm?.cardName || ''}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmRemoveCard}
        />
      </div>
    </Layout>
  );
};

export default BinderView;
