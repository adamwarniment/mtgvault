import React from 'react';
import { X, Eraser, ArrowLeftToLine, RefreshCw, ArrowRightFromLine, BookOpen } from 'lucide-react';
import { Button } from './ui/Button';

interface EditCardOptionsModalProps {
    isOpen: boolean;
    cardName?: string;
    count?: number;
    onClose: () => void;
    onOptionSelect: (option: 'DELETE_EMPTY' | 'DELETE_SHIFT' | 'REPLACE' | 'INSERT') => void;
}

const EditCardOptionsModal: React.FC<EditCardOptionsModalProps> = ({
    isOpen,
    cardName,
    count = 1,
    onClose,
    onOptionSelect,
}) => {
    if (!isOpen) return null;

    const isMassEdit = count > 1;

    const options = [
        {
            id: 'DELETE_EMPTY',
            title: isMassEdit ? `Delete ${count} Cards (Keep Empty)` : 'Delete (Keep Empty)',
            description: isMassEdit ? 'Delete selected cards and keep slots empty' : 'Delete the card and keep the slot empty',
            icon: Eraser,
            color: 'red',
        },
        {
            id: 'DELETE_SHIFT',
            title: isMassEdit ? `Delete ${count} Cards (Shift)` : 'Delete (Shift Cards)',
            description: isMassEdit ? 'Delete cards and shift subsequent cards forward' : 'Delete the card and shift subsequent cards forward',
            icon: ArrowLeftToLine,
            color: 'orange',
        },
        {
            id: 'REPLACE',
            title: isMassEdit ? `Replace ${count} Cards` : 'Replace Card',
            description: isMassEdit ? 'Replace selected cards with a new one' : 'Swap this card with a different one',
            icon: RefreshCw,
            color: 'blue',
        },
        {
            id: 'INSERT',
            title: isMassEdit ? `Insert ${count} Cards` : 'Insert Card',
            description: isMassEdit ? 'Insert copies of a new card at selected positions' : 'Shift cards backward and insert a new card here',
            icon: ArrowRightFromLine,
            color: 'green',
        },
    ] as const;

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
                    borderColor: 'var(--border-primary)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{isMassEdit ? `Edit ${count} Cards` : 'Edit Card'}</h2>
                            {!isMassEdit && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{cardName}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="transition-colors hover:text-blue-500"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onOptionSelect(option.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left group
                                ${option.color === 'red' ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50' : ''}
                                ${option.color === 'orange' ? 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50' : ''}
                                ${option.color === 'blue' ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50' : ''}
                                ${option.color === 'green' ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/50' : ''}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                                    ${option.color === 'red' ? 'bg-red-500/20 group-hover:bg-red-500/30' : ''}
                                    ${option.color === 'orange' ? 'bg-orange-500/20 group-hover:bg-orange-500/30' : ''}
                                    ${option.color === 'blue' ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : ''}
                                    ${option.color === 'green' ? 'bg-green-500/20 group-hover:bg-green-500/30' : ''}
                                `}>
                                    <option.icon className={`w-4 h-4
                                        ${option.color === 'red' ? 'text-red-400' : ''}
                                        ${option.color === 'orange' ? 'text-orange-400' : ''}
                                        ${option.color === 'blue' ? 'text-blue-400' : ''}
                                        ${option.color === 'green' ? 'text-green-400' : ''}
                                    `} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{option.title}</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{option.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
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

export default EditCardOptionsModal;
