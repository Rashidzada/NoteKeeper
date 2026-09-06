import React from 'react';
import { 
  FileText, 
  Star, 
  Bell, 
  FolderPlus, 
  Tag as TagIcon, 
  Hash, 
  Edit3, 
  Trash2,
  X
} from 'lucide-react';

export const Sidebar = ({
  currentFilter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  categories,
  tags,
  notesCount,
  favoritesCount,
  onOpenCategoryModal,
  onEditCategory,
  onDeleteCategory,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 md:z-20 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-100">
          <span className="font-bold text-slate-800 text-sm">Navigation</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Views */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setFilter('all');
              setSelectedCategory(null);
              setSelectedTag(null);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentFilter === 'all' && !selectedCategory && !selectedTag
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>All Notes</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {notesCount}
            </span>
          </button>

          <button
            onClick={() => {
              setFilter('favorites');
              setSelectedCategory(null);
              setSelectedTag(null);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentFilter === 'favorites' && !selectedCategory && !selectedTag
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Favorites</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {favoritesCount}
            </span>
          </button>

          <button
            onClick={() => {
              setFilter('reminders');
              setSelectedCategory(null);
              setSelectedTag(null);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentFilter === 'reminders' && !selectedCategory && !selectedTag
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-purple-600" />
              <span>Reminders</span>
            </div>
          </button>
        </div>

        {/* Categories Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Categories
            </span>
            <button
              onClick={onOpenCategoryModal}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="Add Category"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-0.5 max-h-52 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400 italic">No categories yet</p>
            ) : (
              categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(isSelected ? null : cat.id);
                        onClose();
                      }}
                      className="flex items-center gap-2.5 flex-1 text-left truncate"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(cat);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 px-2">
            <TagIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tags
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 px-1">
            {tags.length === 0 ? (
              <p className="px-2 text-xs text-slate-400 italic">No tags created yet</p>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(isSelected ? null : tag);
                      onClose();
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Hash className="w-3 h-3 opacity-60" />
                    <span>{tag}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
