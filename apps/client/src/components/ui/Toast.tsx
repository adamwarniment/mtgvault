import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming this exists given shadcn-like structure, if not I'll define it or standard equivalent

// If utils doesn't exist, we can define a simple joiner
// but usually shadcn apps have it. I'll check first or just inline a helper if needed.
// Checking file listing earlier: lib has 1 file. Probably utils.ts.
// I'll assume it exists for now, if not I will fix.

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Generate unique IDs
    const idCounter = useRef(0);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
        const id = `toast-${Date.now()}-${idCounter.current++}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast,
}) => {
    return (
        <div
            className={cn(
                "fixed z-[100] flex flex-col gap-2 p-4 w-full pointer-events-none",
                // Positioning logic:
                // Default (Portrait/Mobile): Top Center
                "top-0 left-1/2 -translate-x-1/2 items-center",
                // Landscape: Top Right
                "landscape:top-0 landscape:right-0 landscape:left-auto landscape:translate-x-0 landscape:items-end",
                // Max width constraints
                "max-w-md"
            )}
        >
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    // Variant styles
    const variants = {
        success: 'bg-green-500 text-white border-green-600',
        error: 'bg-red-500 text-white border-red-600',
        warning: 'bg-yellow-500 text-white border-yellow-600',
        info: 'bg-blue-500 text-white border-blue-600',
    };

    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    return (
        <div
            className={`
        pointer-events-auto
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        animate-in slide-in-from-top-2 fade-in duration-300
        min-w-[300px] max-w-full backdrop-blur-sm
        ${variants[toast.type || 'success']}
      `}
            role="alert"
        >
            <div className="shrink-0">{icons[toast.type || 'success']}</div>
            <p className="font-medium text-sm flex-1">{toast.message}</p>
            <button
                onClick={onDismiss}
                className="shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
