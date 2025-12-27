import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// I'll avoid 'cn' dependency if I'm not sure it exists, but usually standard React projects have it.
// I'll check if lib/utils exists first.
// Actually, I'll just write standard string concatenation for now to be safe.

interface CollapsibleSectionProps {
    title: string;
    count: number;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    count,
    children,
    defaultExpanded = true,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`space-y-2 ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full text-left group select-none py-2"
            >
                <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-white/10 text-white' : 'text-gray-500 group-hover:bg-white/5 group-hover:text-gray-300'}`}>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                    {title}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono transition-colors ${isExpanded ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                        {count}
                    </span>
                </h3>

                <div className="flex-1 h-px ml-4 bg-gradient-to-r from-white/10 to-transparent transition-opacity group-hover:from-white/20" />
            </button>

            {isExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};
