import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none max-w-sm w-full px-3">
      <AnimatePresence>
        {notifications.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={`pointer-events-auto rounded-2xl p-3 shadow-xl border flex items-center justify-between gap-3 backdrop-blur-md text-xs font-medium w-full ${
              toast.type === 'success'
                ? 'bg-gray-900/95 text-white border-pink-500/40 shadow-black/20'
                : toast.type === 'error'
                ? 'bg-gray-900/95 text-white border-rose-500/50 shadow-black/20'
                : toast.type === 'warning'
                ? 'bg-gray-900/95 text-white border-amber-500/50 shadow-black/20'
                : 'bg-gray-900/95 text-white border-gray-700/60 shadow-black/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0">
                {toast.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-[#E11D74] animate-pulse" />}
                {toast.type === 'error' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                {toast.type === 'warning' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                {toast.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs truncate">{toast.title}</p>
                <p className="text-gray-300 text-[11px] truncate">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(toast.id)}
              className="shrink-0 text-gray-400 hover:text-white transition-colors p-1"
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

