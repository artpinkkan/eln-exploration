import { useState } from 'react'

const ALL_TAGS = ['Tag CBA', 'R&D', 'Formulasi', 'Packaging', 'Tag ABC', 'Tag UAT']

export default function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    product: '',
    budget: '',
    dueDate: '',
    tags: [],
  })
  const [tagSearch, setTagSearch] = useState('')

  function toggleTag(tag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
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

  const filteredTags = ALL_TAGS.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/15">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between bg-surface-container-low border-b border-outline-variant/10">
          <div>
            <h2 className="text-xl font-extrabold font-headline text-primary tracking-tight">
              Create New Project
            </h2>
            <p className="text-sm text-on-surface-variant font-body">
              Initialize a new research container and budget allocation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-8 space-y-6">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Project Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Phase II Lipid Synthesis"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-surface-container-high border-none rounded-t-lg rounded-b-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-3 text-on-surface placeholder:text-outline font-body transition-all"
                required
              />
            </div>

            {/* Product & Budget */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Product <span className="text-error">*</span>
                </label>
                <select
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                  className="w-full bg-surface-container-high border-none rounded-t-lg rounded-b-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-3 text-on-surface font-body appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Reagent Synthesis">Reagent Synthesis</option>
                  <option value="Clinical Trial">Clinical Trial</option>
                  <option value="Data Analysis">Data Analysis</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                  Budget <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    className="w-full bg-surface-container-high border-none rounded-t-lg rounded-b-none border-b-2 border-transparent focus:border-primary focus:ring-0 pl-12 pr-4 py-3 text-on-surface placeholder:text-outline font-body transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Due Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-surface-container-high border-none rounded-t-lg rounded-b-none border-b-2 border-transparent focus:border-primary focus:ring-0 px-4 py-3 text-on-surface font-body"
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Project Tags
              </label>
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col">
                <div className="max-h-40 overflow-y-auto bg-surface-container-lowest p-2 space-y-1">
                  {filteredTags.map((tag) => (
                    <label
                      key={tag}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                        form.tags.includes(tag)
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-surface-container'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="w-4 h-4 rounded border-outline text-primary focus:ring-primary"
                      />
                      <span className={`text-sm font-medium ${form.tags.includes(tag) ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-outline-variant/30 p-2 bg-surface-container-low flex flex-wrap gap-2 items-center">
                  <div className="flex flex-wrap gap-1">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Search or add tags"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm py-1 placeholder:text-outline"
                  />
                  <span className="material-symbols-outlined text-outline text-sm">search</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-surface-container-low flex justify-end gap-4 items-center border-t border-outline-variant/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-md text-sm font-bold text-primary border border-outline/20 hover:bg-surface-container transition-all font-label uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-md text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-primary-container hover:opacity-95 active:scale-95 transition-all shadow-md font-label uppercase tracking-widest"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
