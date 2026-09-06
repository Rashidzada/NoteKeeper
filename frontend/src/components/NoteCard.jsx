import React from 'react';
import { Star, Bell, Calendar, Edit2, Trash2, Tag } from 'lucide-react';

export const NoteCard = ({
  note,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  viewMode = 'grid',
}) => {
  const formattedDate = new Date(note.updated_at || note.created_at).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  const formattedReminder = note.reminder
    ? new Date(note.reminder).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // Custom note color styling
  const customColor = note.color || '#ffffff';
  const isLight = customColor === '#ffffff' || customColor === '#FEF3C7' || customColor === '#DBEAFE' || customColor === '#FEE2E2' || customColor === '#D1FAE5' || customColor === '#EDE9FE';

  if (viewMode === 'list') {
    return (
      <div
        className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${
          isSelected ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200'
        }`}
        style={{ borderLeftColor: note.color || '#3b82f6', borderLeftWidth: '5px' }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(note.id)}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
        />

        <button
          onClick={() => onToggleFavorite(note)}
          className="text-slate-300 hover:text-amber-500 transition-colors"
          title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-4 h-4 ${
              note.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
            }`}
          />
        </button>

        <div className="flex-1 min-w-0" onClick={() => onEdit(note)}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">
              {note.title}
            </h3>
            {note.category && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white truncate max-w-[120px]"
                style={{ backgroundColor: note.category.color || '#64748b' }}
              >
                {note.category.name}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm line-clamp-1">{note.content}</p>
        </div>

        {/* Tags */}
        <div className="hidden lg:flex items-center gap-1 max-w-[200px] overflow-hidden">
          {note.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Reminder */}
        {formattedReminder && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            <Bell className="w-3 h-3" />
            <span>{formattedReminder}</span>
          </div>
        )}

        <div className="text-xs text-slate-400 shrink-0 hidden md:block">
          {formattedDate}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-200'
      }`}
      style={{
        backgroundColor: note.color && note.color !== '#ffffff' ? `${note.color}15` : '#ffffff',
        borderColor: isSelected ? undefined : (note.color ? `${note.color}50` : undefined),
      }}
    >
      <div>
        {/* Card Header: Category & Favorite */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(note.id)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            {note.category ? (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: note.category.color || '#64748b' }}
              >
                {note.category.name}
              </span>
            ) : (
              <span className="text-xs text-slate-400">Uncategorized</span>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(note)}
            className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
            title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-4 h-4 ${
                note.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onEdit(note)}
          className="font-bold text-slate-800 text-base mb-2 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
        >
          {note.title}
        </h3>

        {/* Content Preview */}
        <p
          onClick={() => onEdit(note)}
          className="text-slate-600 text-xs sm:text-sm line-clamp-4 mb-4 whitespace-pre-wrap cursor-pointer"
        >
          {note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {formattedReminder ? (
            <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
              <Bell className="w-3 h-3" />
              <span>{formattedReminder}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit note"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
