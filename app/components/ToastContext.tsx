'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

// Convenience hooks
export function useToastHelpers() {
    const { addToast } = useToast();
    return {
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        warning: (message: string) => addToast(message, 'warning'),
        info: (message: string) => addToast(message, 'info'),
    };
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-24 right-4 sm:right-8 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Single Toast Item
function ToastItem({ toast, onDismiss }: { toast: Toast, onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-rose-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
    };

    const borderColors = {
        success: 'border-l-emerald-500',
        error: 'border-l-rose-500',
        warning: 'border-l-amber-500',
        info: 'border-l-blue-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`glass-card p-4 flex items-start gap-3 border-l-4 ${borderColors[toast.type]} pointer-events-auto shadow-xl`}
        >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={onDismiss}
                className="shrink-0 text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}
