import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-none max-w-sm w-[92%] sm:w-auto px-2">
      <AnimatePresence>
        {notifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-auto rounded-full px-4 py-2 shadow-lg border flex items-center gap-2.5 backdrop-blur-md text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-gray-900/95 text-white border-emerald-500/50 shadow-black/20'
                : toast.type === 'error'
                ? 'bg-rose-950/95 text-white border-rose-600/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-white border-amber-500/50'
                : 'bg-gray-900/95 text-white border-gray-700/50'
            }`}
          >
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-pink-400" />}
            </div>
            <div className="flex items-center gap-1.5 truncate max-w-[260px] sm:max-w-xs">
              <span className="font-bold text-white text-xs">{toast.title}:</span>
              <span className="text-gray-200 text-xs truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissNotification(toast.id)}
              className="shrink-0 text-gray-400 hover:text-white transition-colors ml-1 p-0.5"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

