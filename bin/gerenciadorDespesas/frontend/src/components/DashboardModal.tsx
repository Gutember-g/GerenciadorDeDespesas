import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const DashboardModal = ({ isOpen, onClose, title, children }: DashboardModalProps) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[560px] max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#081321] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#081321]/95 px-6 py-4 backdrop-blur-xl shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [color-scheme:light] dark:[color-scheme:dark]">
          {children}
        </div>
      </div>
    </div>
  );
};
