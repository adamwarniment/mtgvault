import React, { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { X, Search } from 'lucide-react';
import { AVAILABLE_ICONS, SEARCH_ICONS } from '../constants/icons';

interface EditPageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, icon: string) => void;
    initialName: string;
    initialIcon: string;
}

const EditPageModal: React.FC<EditPageModalProps> = ({ isOpen, onClose, onSave, initialName, initialIcon }) => {
    const [name, setName] = useState(initialName);
    const [icon, setIcon] = useState(initialIcon);
    const [searchQuery, setSearchQuery] = useState('');

    // Reset state when opening (if using a key/id approach) or via effect
    React.useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setIcon(initialIcon);
            setSearchQuery('');
        }
    }, [isOpen, initialName, initialIcon]);

    const filteredIcons = useMemo(() => {
        if (!searchQuery) return [];
        return SEARCH_ICONS.filter(i => i.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 50); // Limit results
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
            >

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Edit Page Details</h2>
                    <button onClick={onClose} className="transition-colors hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">

                    {/* Page Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Page Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rare Lands"
                            className="bg-transparent"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--text-primary)'
                            }}
                            autoFocus
                        />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Page Icon</label>

                        <div className="flex items-center gap-4 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                                <i className={`ms ms-${icon} ms-cost text-2xl text-blue-400`}></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Selected Icon</p>
                                <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{icon}</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            <Input
                                placeholder="Search icons (e.g. boros, forest, dragon)..."
                                className="pl-9 bg-transparent text-sm"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--text-primary)'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Icon Grid */}
                        <div className="h-48 overflow-y-auto custom-scrollbar border rounded-lg p-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>

                            {searchQuery ? (
                                <div className="grid grid-cols-6 gap-2">
                                    {filteredIcons.map(iconName => (
                                        <button
                                            key={iconName}
                                            onClick={() => setIcon(iconName)}
                                            className={`aspect-square flex items-center justify-center rounded-lg transition-all ${icon === iconName ? 'bg-blue-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                                            style={{ color: icon === iconName ? '#fff' : 'var(--text-secondary)' }}
                                            title={iconName}
                                        >
                                            <i className={`ms ms-${iconName} ms-cost text-xl`}></i>
                                        </button>
                                    ))}
                                    {filteredIcons.length === 0 && (
                                        <div className="col-span-6 text-center py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>No icons found</div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs font-medium mb-2 uppercase tracking-wider px-1" style={{ color: 'var(--text-tertiary)' }}>Common Icons</p>
                                    <div className="grid grid-cols-6 gap-2">
                                        {AVAILABLE_ICONS.map(iconName => (
                                            <button
                                                key={iconName}
                                                onClick={() => setIcon(iconName)}
                                                className={`aspect-square flex items-center justify-center rounded-lg transition-all ${icon === iconName ? 'bg-blue-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                                                style={{ color: icon === iconName ? '#fff' : 'var(--text-secondary)' }}
                                                title={iconName}
                                            >
                                                <i className={`ms ms-${iconName} ms-cost text-xl`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <Button variant="ghost" onClick={onClose} className="hover:text-white" style={{ color: 'var(--text-secondary)' }}>Cancel</Button>
                    <Button onClick={() => onSave(name, icon)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">Save Changes</Button>
                </div>

            </div>
        </div>
    );
};

export default EditPageModal;
