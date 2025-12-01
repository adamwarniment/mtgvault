import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning',
}) => {
    if (!isOpen) return null;

    const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-yellow-500' : 'text-blue-500';

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <Card
                className="w-full max-w-md shadow-2xl shadow-purple-500/20 animate-in"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center ${iconColor}`}>
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <CardTitle>{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-300">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <Button onClick={onCancel} variant="outline">
                            {cancelText}
                        </Button>
                        <Button onClick={onConfirm} variant={variant === 'danger' ? 'destructive' : 'default'}>
                            {confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfirmDialog;
