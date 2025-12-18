import React from 'react';
import { X, RefreshCw, Loader2, ExternalLink, Check, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import manapoolLogo from '../assets/manapool-logo.png';
import tcgplayerLogo from '../assets/tcgplayer-logo.png';
import ebayLogo from '../assets/ebay-logo.png';

interface CardDetailsModalProps {
    card: any;
    onClose: () => void;
    onRefresh: () => Promise<void>;
    onTogglePurchased: (isPurchased: boolean) => void;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ card, onClose, onRefresh, onTogglePurchased }) => {
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    if (!card) return null;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    const cleanedName = card.name.replace(/,/g, '');
    const ebaySearchTerm = `${cleanedName} ${card.collectorNumber}`;
    const ebayBuyItNowUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(ebaySearchTerm)}&_sacat=0&_from=R40&LH_BIN=1&_sop=15`;
    const ebayAuctionUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(ebaySearchTerm)}&_sacat=0&_from=R40&LH_Auction=1&_sop=1`;

    return (
        <>
            {/* Mobile Sticky Close Button - Moved outside to ensure fixed positioning works */}
            <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="fixed top-20 right-4 z-[70] md:hidden bg-black/50 text-white hover:text-gray-300 rounded-full border border-white/10 shadow-lg animate-in fade-in duration-200"
            >
                <X className="w-6 h-6" />
            </Button>

            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start md:items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto"
                onClick={onClose}
            >
                <div className="relative w-full md:w-fit max-w-6xl animate-in flex gap-6 md:gap-8 flex-col md:flex-row items-center md:items-start mt-32 mb-24 md:my-0" onClick={(e) => e.stopPropagation()}>
                    {/* Desktop Close Button */}
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex absolute -top-12 -right-12 text-white hover:text-gray-300 z-50 bg-transparent rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    {/* Card Image */}
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30 flex-shrink-0 w-auto flex justify-center bg-transparent border-2 border-white/25 ring-1 ring-black/50">
                        <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="max-h-[50vh] md:max-h-[85vh] w-auto h-auto rounded-2xl object-contain"
                        />
                    </div>

                    {/* Details Panel */}
                    <div className="w-full md:w-[350px] bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col h-auto md:h-[85vh] md:overflow-y-auto shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{card.name}</h2>
                        {card.set && (
                            <div className="flex items-center gap-2 text-purple-300 font-mono text-sm mb-6">
                                <span className="px-2 py-0.5 bg-purple-500/20 rounded border border-purple-500/30">{card.set.toUpperCase()}</span>
                                <span className="text-gray-400">#{card.collectorNumber}</span>
                            </div>
                        )}

                        <Button
                            onClick={() => onTogglePurchased(!card.isPurchased)}
                            className={`w-full mb-6 gap-2 transition-all duration-300 ${card.isPurchased
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                                : 'bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                            variant={card.isPurchased ? "default" : "outline"}
                        >
                            {card.isPurchased ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Marked as Purchased
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Mark as Purchased
                                </>
                            )}
                        </Button>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-400 text-xs uppercase tracking-wider">Market Price</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="h-6 px-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                    {isRefreshing ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    ) : (
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                            {card.priceUsd ? (
                                <p className="text-2xl font-bold text-green-400 font-mono">${card.priceUsd.toFixed(2)}</p>
                            ) : (
                                <p className="text-xl font-bold text-gray-500 font-mono">--</p>
                            )}
                        </div>

                        <a
                            href={`https://manapool.com/card/${card.set?.toLowerCase()}/${card.collectorNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-black/40 p-1.5 flex items-center justify-center border border-white/5">
                                <img src={manapoolLogo} alt="Mana Pool" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">Buy on Mana Pool</p>
                                <p className="text-gray-400 text-xs">View current listings</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </a>

                        {card.tcgplayerUrl && (
                            <a
                                href={`${card.tcgplayerUrl}?Language=English&Printing=Normal|Foil&page=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-black/40 p-1.5 flex items-center justify-center border border-white/5">
                                    <img src={tcgplayerLogo} alt="TCGPlayer" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">Buy on TCGPlayer</p>
                                    <p className="text-gray-400 text-xs">View current listings</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                            </a>
                        )}

                        {/* eBay Buttons */}
                        <div className="flex w-full gap-2 mb-6">
                            <a
                                href={ebayBuyItNowUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0 flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-white/5 flex-shrink-0">
                                    <img src={ebayLogo} alt="eBay" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-xs group-hover:text-blue-400 transition-colors">Buy It Now</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            </a>

                            <a
                                href={ebayAuctionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0 flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-white/5 flex-shrink-0">
                                    <img src={ebayLogo} alt="eBay" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-xs group-hover:text-blue-400 transition-colors">Auction</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            </a>
                        </div>

                        <div className="flex-1 border-t border-white/10 pt-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-gray-400 text-sm italic text-center">More card details coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CardDetailsModal;
