import React from 'react';
import { Trash2, X } from 'lucide-react';

export const BatchActionBar = ({
  selectedCount,
  onDeleteSelected,
  onClearSelection,
  isDeleting,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce-in">
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
          {selectedCount}
        </span>
        <span className="text-xs sm:text-sm font-medium">notes selected</span>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={onDeleteSelected}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isDeleting ? 'Deleting...' : 'Delete Selected'}</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
