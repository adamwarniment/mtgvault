import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';

interface DeleteCardModalProps {
    isOpen: boolean;
    cardName: string;
    onClose: () => void;
    onConfirm: (shiftCards: boolean) => void;
}

const DeleteCardModal: React.FC<DeleteCardModalProps> = ({
    isOpen,
    cardName,
    onClose,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Remove Card</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-gray-300">
                        You are about to remove <span className="font-semibold text-white">"{cardName}"</span> from this binder.
                    </p>

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-400">What should happen to the empty slot?</p>

                        {/* Option 1: Shift Cards */}
                        <button
                            onClick={() => onConfirm(true)}
                            className="w-full p-4 rounded-xl border-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-left group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1">Shift Cards Forward</h3>
                                    <p className="text-sm text-gray-400">All cards after this position will move forward to fill the gap</p>
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Keep Empty */}
                        <button
                            onClick={() => onConfirm(false)}
                            className="w-full p-4 rounded-xl border-2 border-gray-600/30 bg-gray-700/10 hover:bg-gray-700/20 hover:border-gray-600/50 transition-all text-left group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-600/30 transition-colors">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1">Keep Slot Empty</h3>
                                    <p className="text-sm text-gray-400">The slot will remain empty and card positions stay the same</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-700">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCardModal;
