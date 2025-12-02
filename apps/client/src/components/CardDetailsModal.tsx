import React from 'react';
import { X, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface CardDetailsModalProps {
    card: any;
    onClose: () => void;
    onRefresh: () => Promise<void>;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ card, onClose, onRefresh }) => {
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

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="relative w-fit max-w-6xl animate-in flex gap-6 md:gap-8 flex-col md:flex-row items-start" onClick={(e) => e.stopPropagation()}>
                <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="absolute -top-12 right-0 text-white hover:text-gray-300"
                >
                    <X className="w-6 h-6" />
                </Button>

                {/* Card Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30 flex-shrink-0">
                    <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="max-h-[85vh] w-auto rounded-2xl object-contain"
                    />
                </div>

                {/* Details Panel */}
                <div className="w-full md:w-[350px] bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col h-auto md:h-[85vh] overflow-y-auto shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{card.name}</h2>
                    {card.set && (
                        <div className="flex items-center gap-2 text-purple-300 font-mono text-sm mb-6">
                            <span className="px-2 py-0.5 bg-purple-500/20 rounded border border-purple-500/30">{card.set.toUpperCase()}</span>
                            <span className="text-gray-400">#{card.collectorNumber}</span>
                        </div>
                    )}

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

                    <div className="flex-1 border-t border-white/10 pt-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-gray-400 text-sm italic text-center">More card details coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardDetailsModal;
