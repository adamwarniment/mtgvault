import React from 'react';
import { X, Eraser, ArrowLeftToLine, RefreshCw, ArrowRightFromLine, BookOpen } from 'lucide-react';
import { Button } from './ui/Button';

interface EditCardOptionsModalProps {
    isOpen: boolean;
    cardName: string;
    onClose: () => void;
    onOptionSelect: (option: 'DELETE_EMPTY' | 'DELETE_SHIFT' | 'REPLACE' | 'INSERT') => void;
}

const EditCardOptionsModal: React.FC<EditCardOptionsModalProps> = ({
    isOpen,
    cardName,
    onClose,
    onOptionSelect,
}) => {
    if (!isOpen) return null;

    const options = [
        {
            id: 'DELETE_EMPTY',
            title: 'Delete (Keep Empty)',
            description: 'Delete the card and keep the slot empty',
            icon: Eraser,
            color: 'red',
        },
        {
            id: 'DELETE_SHIFT',
            title: 'Delete (Shift Cards)',
            description: 'Delete the card and shift subsequent cards forward',
            icon: ArrowLeftToLine,
            color: 'orange',
        },
        {
            id: 'REPLACE',
            title: 'Replace Card',
            description: 'Swap this card with a different one',
            icon: RefreshCw,
            color: 'blue',
        },
        {
            id: 'INSERT',
            title: 'Insert Card',
            description: 'Shift cards backward and insert a new card here',
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
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Edit Card</h2>
                            <p className="text-xs text-gray-400">{cardName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
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
                                    <h3 className="font-semibold text-white mb-1">{option.title}</h3>
                                    <p className="text-sm text-gray-400">{option.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
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

export default EditCardOptionsModal;
