import { useState, useRef, useEffect } from 'react'

export const PEOPLE = [
  'Dr. Aris Thorne',
  'Elena Smith',
  'Julian Vance',
  'Dr. Sarah Kim',
  'Marcus Lee',
  'Dr. Wei Chen',
  'Priya Nair',
  'Tom Eriksson',
]

export default function MultiSelect({ label, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = PEOPLE.filter(
    (p) => p.toLowerCase().includes(query.toLowerCase()) && !selected.includes(p)
  )

  function toggle(person) {
    onChange(
      selected.includes(person)
        ? selected.filter((s) => s !== person)
        : [...selected, person]
    )
  }

  function remove(person, e) {
    e.stopPropagation()
    onChange(selected.filter((s) => s !== person))
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-semibold text-slate-600">{label}</label>

      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[40px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
      >
        {selected.length === 0 && (
          <span className="text-sm text-slate-400">{placeholder}</span>
        )}
        {selected.map((person) => (
          <span
            key={person}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
          >
            {person}
            <button type="button" onClick={(e) => remove(person, e)} className="hover:text-primary/60">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
            </button>
          </span>
        ))}
        <span className="ml-auto shrink-0 text-slate-400">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </span>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-primary"
            />
          </div>
          <ul className="max-h-44 overflow-y-auto py-1">
            {selected.map((person) => (
              <li
                key={person}
                onClick={() => toggle(person)}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-primary"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>check_box</span>
                {person}
              </li>
            ))}
            {filtered.length > 0 ? (
              filtered.map((person) => (
                <li
                  key={person}
                  onClick={() => toggle(person)}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '16px' }}>check_box_outline_blank</span>
                  {person}
                </li>
              ))
            ) : (
              !selected.length && (
                <li className="px-3 py-3 text-sm text-slate-400 text-center">No results</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
