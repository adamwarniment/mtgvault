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
            <div className="relative rounded-2xl shadow-2xl border max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)' // Was red-500/30 but border-primary is safer for neutral, or maybe standard danger color? Original was red-500/30. I'll stick to border-primary for consistency or red if it's destructive. Let's start with border-primary but maybe keep red accent? The header has red trash.
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Remove Card</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="transition-colors hover:text-red-500"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You are about to remove <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>"{cardName}"</span> from this binder.
                    </p>

                    <div className="space-y-3">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>What should happen to the empty slot?</p>

                        {/* Option 1: Shift Cards */}
                        <button
                            onClick={() => onConfirm(true)}
                            className="w-full p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-left group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Shift Cards Forward</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All cards after this position will move forward to fill the gap</p>
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Keep Empty */}
                        <button
                            onClick={() => onConfirm(false)}
                            className="w-full p-4 rounded-xl border-2 transition-all text-left group"
                            style={{
                                borderColor: 'var(--border-primary)',
                                backgroundColor: 'var(--input-bg)'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                    <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Keep Slot Empty</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>The slot will remain empty and card positions stay the same</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
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
