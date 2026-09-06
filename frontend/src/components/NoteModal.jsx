import React, { useState, useEffect } from 'react';
import { X, Tag, Star, Bell, Palette, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#ffffff', // White
  '#fef3c7', // Warm Amber
  '#fee2e2', // Rose Red
  '#dbeafe', // Sky Blue
  '#d1fae5', // Mint Emerald
  '#ede9fe', // Soft Purple
  '#ffedd5', // Orange Peach
  '#f1f5f9', // Light Slate
];

export const NoteModal = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialNote = null,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [reminder, setReminder] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setCategoryId(initialNote.category_id || '');
      setTags(initialNote.tags || []);
      setIsFavorite(initialNote.is_favorite || false);
      setColor(initialNote.color || '#ffffff');
      if (initialNote.reminder) {
        // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local
        const d = new Date(initialNote.reminder);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setReminder(formatted);
      } else {
        setReminder('');
      }
    } else {
      setTitle('');
      setContent('');
      setCategoryId('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setColor('#ffffff');
      setReminder('');
    }
    setError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (clean && !tags.includes(clean)) {
        if (tags.length >= 10) {
          setError('Maximum 10 tags allowed per note');
          return;
        }
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId || null,
      tags,
      is_favorite: isFavorite,
      color: color || null,
      reminder: reminder ? new Date(reminder).toISOString() : null,
    };

    setIsSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to save note';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        style={{ backgroundColor: color && color !== '#ffffff' ? `${color}25` : '#ffffff' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              {initialNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-1.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-50 border-amber-200 text-amber-500 fill-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Starred note' : 'Mark as favorite'}
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              maxLength={200}
              className="w-full text-xl font-bold placeholder-slate-400 text-slate-800 bg-transparent border-b border-slate-200 focus:border-blue-600 pb-2 outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Category & Reminder Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">(No Category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Bell className="w-3 h-3 text-purple-600" />
                <span>Reminder (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note details here..."
              rows={8}
              maxLength={10000}
              className="w-full p-3.5 bg-white/90 border border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Tags Adder */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-600" />
              <span>Tags (Press Enter or comma to add, max 10)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/90 border border-slate-200 rounded-xl">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'Type tag and press Enter...' : 'Add more...'}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-700 outline-none px-1 py-0.5"
              />
            </div>
          </div>

          {/* Color Picker Swatches */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
              <Palette className="w-3 h-3 text-slate-500" />
              <span>Note Background Tint</span>
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-slate-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
