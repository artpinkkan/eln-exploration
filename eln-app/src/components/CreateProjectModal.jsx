import { useState, useRef } from 'react'

const DEFAULT_TAGS = ['Tag CBA', 'R&D', 'Formulasi', 'Packaging', 'Tag ABC', 'Tag UAT']
const STORAGE_KEY = 'eln_project_tags'

function loadTags() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_TAGS
  } catch {
    return DEFAULT_TAGS
  }
}

function saveTags(tags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
}

export default function CreateProjectModal({ onClose, onCreate }) {
  const [allTags, setAllTags] = useState(loadTags)
  const [tagInput, setTagInput] = useState('')
  const [tagFocused, setTagFocused] = useState(false)
  const tagInputRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    product: '',
    budget: '',
    dueDate: '',
    tags: [],
  })

  const suggestions = tagInput.trim()
    ? allTags.filter(
        (t) =>
          t.toLowerCase().includes(tagInput.toLowerCase()) &&
          !form.tags.includes(t)
      )
    : allTags.filter((t) => !form.tags.includes(t))

  function selectTag(tag) {
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    setTagInput('')
    tagInputRef.current?.focus()
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleAddTag() {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (form.tags.includes(trimmed)) { setTagInput(''); return }
    if (!allTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...allTags, trimmed]
      setAllTags(updated)
      saveTags(updated)
    }
    setForm((f) => ({ ...f, tags: [...f.tags, trimmed] }))
    setTagInput('')
    tagInputRef.current?.focus()
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate({
      id: `PRJ-${Date.now()}`,
      name: form.name,
      product: form.product || 'N/A',
      budgetValue: form.budget ? Number(form.budget) : 0,
      dueDate: form.dueDate
        ? new Date(form.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : '—',
      dueDateISO: form.dueDate || '',
      tags: form.tags,
      status: 'Active',
      owner: 'Pinkan P.',
      exp: 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>folder_open</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Project</h2>
              <p className="text-[11px] text-slate-400">Fill in the details to initialize a project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-3">

            {/* Project Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Phase II Lipid Synthesis"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400"
                required
              />
            </div>

            {/* Product & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select…</option>
                  <option value="Reagent Synthesis">Reagent Synthesis</option>
                  <option value="Clinical Trial">Clinical Trial</option>
                  <option value="Data Analysis">Data Analysis</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Budget (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags</label>
              <div className="relative">
                {/* Tag input box */}
                <div
                  onClick={() => tagInputRef.current?.focus()}
                  className={`min-h-[38px] flex flex-wrap gap-1.5 px-2.5 py-1.5 bg-slate-50 border rounded-lg cursor-text transition-all ${
                    tagFocused ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
                  }`}
                >
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-semibold">
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                        className="text-primary/60 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => setTagFocused(true)}
                    onBlur={() => setTimeout(() => setTagFocused(false), 150)}
                    placeholder={form.tags.length === 0 ? 'Search or create tag…' : ''}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-xs placeholder-slate-400 py-0.5"
                  />
                </div>

                {/* Suggestions dropdown */}
                {tagFocused && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.length > 0 ? (
                      <div className="py-1 max-h-36 overflow-y-auto">
                        {suggestions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectTag(tag) }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '13px' }}>label</span>
                            {tag}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {tagInput.trim() && !allTags.some((t) => t.toLowerCase() === tagInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handleAddTag() }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary font-semibold hover:bg-primary/5 transition-colors border-t border-slate-100 text-left"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add</span>
                        Create "{tagInput.trim()}"
                      </button>
                    )}
                    {suggestions.length === 0 && !tagInput.trim() && (
                      <p className="px-3 py-2 text-[10px] text-slate-400">No more tags available</p>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Press Enter or pick from the list. Backspace removes the last tag.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
