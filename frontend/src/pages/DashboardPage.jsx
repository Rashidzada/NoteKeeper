import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Search, 
  ArrowUpDown, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle,
  Folder,
  Tag as TagIcon
} from 'lucide-react';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { NoteCard } from '../components/NoteCard';
import { NoteModal } from '../components/NoteModal';
import { CategoryModal } from '../components/CategoryModal';
import { BatchActionBar } from '../components/BatchActionBar';

export const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [currentFilter, setFilter] = useState('all'); // 'all', 'favorites', 'reminders'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 12;

  // View & Selection
  const [viewMode, setViewMode] = useState('grid');
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Fetch Notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedTag) params.tag = selectedTag;
      if (currentFilter === 'favorites') params.is_favorite = true;

      const res = await api.getNotes(params);
      let items = res.data.items;

      // In-memory filter for reminders if filter is set to reminders
      if (currentFilter === 'reminders') {
        items = items.filter((n) => !!n.reminder);
      }

      setNotes(items);
      setTotalNotes(res.data.total);

      // Extract unique tags from notes
      const tagsSet = new Set();
      items.forEach((n) => {
        n.tags?.forEach((t) => tagsSet.add(t));
      });
      setAvailableTags((prev) => Array.from(new Set([...prev, ...Array.from(tagsSet)])));
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, selectedCategory, selectedTag, currentFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Note CRUD Handlers
  const handleSaveNote = async (payload) => {
    if (editingNote) {
      const res = await api.updateNote(editingNote.id, payload);
      setNotes(notes.map((n) => (n.id === editingNote.id ? res.data : n)));
    } else {
      const res = await api.createNote(payload);
      setNotes([res.data, ...notes]);
      setTotalNotes((prev) => prev + 1);
    }
    fetchNotes();
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.deleteNote(noteId);
        setNotes(notes.filter((n) => n.id !== noteId));
        setSelectedNoteIds((prev) => prev.filter((id) => id !== noteId));
        setTotalNotes((prev) => Math.max(0, prev - 1));
      } catch (err) {
        alert('Failed to delete note');
      }
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      const newFav = !note.is_favorite;
      const res = await api.updateNote(note.id, { is_favorite: newFav });
      setNotes(notes.map((n) => (n.id === note.id ? res.data : n)));
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  // Batch Selection Handlers
  const handleToggleSelectNote = (id) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = async () => {
    if (
      window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected notes?`)
    ) {
      setBatchDeleting(true);
      try {
        await api.batchDeleteNotes(selectedNoteIds);
        setNotes(notes.filter((n) => !selectedNoteIds.includes(n.id)));
        setTotalNotes((prev) => Math.max(0, prev - selectedNoteIds.length));
        setSelectedNoteIds([]);
      } catch (err) {
        alert('Failed to delete selected notes');
      } finally {
        setBatchDeleting(false);
      }
    }
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (payload) => {
    if (editingCategory) {
      await api.updateCategory(editingCategory.id, payload);
    } else {
      await api.createCategory(payload);
    }
    fetchCategories();
    fetchNotes();
  };

  const handleDeleteCategory = async (category) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${category.name}"? Notes inside will become uncategorized.`
      )
    ) {
      try {
        await api.deleteCategory(category.id);
        if (selectedCategory === category.id) setSelectedCategory(null);
        fetchCategories();
        fetchNotes();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  const totalPages = Math.ceil(totalNotes / limit) || 1;
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreateModal={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentFilter={currentFilter}
          setFilter={(f) => {
            setFilter(f);
            setPage(1);
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={(catId) => {
            setSelectedCategory(catId);
            setPage(1);
          }}
          selectedTag={selectedTag}
          setSelectedTag={(tag) => {
            setSelectedTag(tag);
            setPage(1);
          }}
          categories={categories}
          tags={availableTags}
          notesCount={totalNotes}
          favoritesCount={notes.filter((n) => n.is_favorite).length}
          onOpenCategoryModal={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setEditingCategory(cat);
            setIsCategoryModalOpen(true);
          }}
          onDeleteCategory={handleDeleteCategory}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Top Bar: Active Filters & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                {currentFilter === 'favorites'
                  ? 'Favorite Notes'
                  : currentFilter === 'reminders'
                  ? 'Reminders'
                  : currentCategoryObj
                  ? currentCategoryObj.name
                  : selectedTag
                  ? `#${selectedTag}`
                  : 'All Notes'}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {totalNotes}
              </span>

              {/* Active Filter Badges */}
              {(selectedCategory || selectedTag || search) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedTag(null);
                    setSearch('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 text-xs font-medium transition-colors"
                >
                  <span>Reset filters</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-slate-700 focus:border-blue-500"
              >
                <option value="created_at">Date Created</option>
                <option value="updated_at">Date Updated</option>
                <option value="title">Title</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-medium text-slate-700 focus:border-blue-500"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* Notes Grid / List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-slate-200/70 rounded-2xl" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No notes found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
                {search || selectedCategory || selectedTag
                  ? 'Try changing your search keywords or filter criteria.'
                  : 'Start capturing your thoughts, tasks, and ideas in one place.'}
              </p>
              <button
                onClick={() => {
                  setEditingNote(null);
                  setIsNoteModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create your first note</span>
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'flex flex-col gap-2.5'
              }
            >
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteIds.includes(note.id)}
                  onToggleSelect={handleToggleSelectNote}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={(n) => {
                    setEditingNote(n);
                    setIsNoteModalOpen(true);
                  }}
                  onDelete={handleDeleteNote}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-xs text-slate-500">
                Page <span className="font-semibold">{page}</span> of{' '}
                <span className="font-semibold">{totalPages}</span> ({totalNotes} total notes)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedNoteIds.length}
        onDeleteSelected={handleBatchDelete}
        onClearSelection={() => setSelectedNoteIds([])}
        isDeleting={batchDeleting}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        categories={categories}
        initialNote={editingNote}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        initialCategory={editingCategory}
      />
    </div>
  );
};
