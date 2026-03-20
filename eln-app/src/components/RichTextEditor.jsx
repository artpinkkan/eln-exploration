import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import ImageAnnotateModal from './ImageAnnotateModal'

/* ─── Constants ─────────────────────────────── */
const HEADINGS = [
  { label: 'Normal',    tag: 'p'  },
  { label: 'Heading 1', tag: 'h1' },
  { label: 'Heading 2', tag: 'h2' },
  { label: 'Heading 3', tag: 'h3' },
]
const TEXT_COLORS = [
  '#000000','#374151','#6B7280','#9CA3AF',
  '#DC2626','#EA580C','#CA8A04','#16A34A',
  '#0891B2','#2563EB','#7C3AED','#DB2777',
  '#7F1D1D','#78350F','#14532D','#1E3A8A',
]
const BG_COLORS = [
  'transparent','#F8FAFC','#FEF9C3','#FEF08A',
  '#DCFCE7','#DBEAFE','#EDE9FE','#FCE7F3',
  '#FEE2E2','#FFF7ED','#CCFBF1','#F0F9FF',
]
const QUICK_FORMULAS = [
  'C = n / V',
  'mass = c × V × MW',
  'pH = -log[H⁺]',
  'yield = (actual / theoretical) × 100',
]
const SAFE_MATH = /^[\d\s+\-*/%.()eE,]+$/
function tryEval(expr) {
  const clean = expr.replace(/\^/g, '**')
  if (!SAFE_MATH.test(clean)) return null
  try {
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict"; return (' + clean + ')')()
    if (typeof val === 'number' && isFinite(val))
      return parseFloat(val.toPrecision(10)).toString()
  } catch {}
  return null
}

/* ─── Small UI pieces ────────────────────────── */
function Divider() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />
}
function TBtn({ icon, title, onMouseDown, active }) {
  return (
    <button
      title={title}
      onMouseDown={onMouseDown}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors shrink-0 ${
        active ? 'bg-primary/15 text-primary' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
    </button>
  )
}
function Popover({ children, className = '' }) {
  return (
    <div className={`absolute top-full left-0 mt-1.5 z-[60] bg-white border border-slate-200 rounded-xl shadow-xl ${className}`}>
      {children}
    </div>
  )
}
function ColorPalette({ colors, onSelect }) {
  return (
    <div className="p-2.5 w-40">
      <div className="grid grid-cols-4 gap-1">
        {colors.map((c, i) => (
          <button
            key={i}
            title={c}
            onMouseDown={(e) => { e.preventDefault(); onSelect(c) }}
            className="w-6 h-6 rounded border border-slate-200 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden"
            style={{ background: c === 'transparent' ? undefined : c }}
          >
            {c === 'transparent' && (
              <svg width="20" height="20" viewBox="0 0 20 20">
                <line x1="2" y1="2" x2="18" y2="18" stroke="#ef4444" strokeWidth="2" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-500 hover:text-slate-700">
          <input type="color" className="w-5 h-5 cursor-pointer rounded border-0 p-0" onChange={(e) => onSelect(e.target.value)} />
          Custom
        </label>
      </div>
    </div>
  )
}
function TablePicker({ onInsert }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const MAX = 8
  return (
    <div className="p-3">
      <p className="text-[10px] text-slate-400 mb-2 h-4">
        {hover.r > 0 ? `${hover.r} × ${hover.c} Table` : 'Hover to select size'}
      </p>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAX}, 20px)` }}
        onMouseLeave={() => setHover({ r: 0, c: 0 })}>
        {Array.from({ length: MAX }, (_, r) =>
          Array.from({ length: MAX }, (_, c) => (
            <div
              key={`${r}-${c}`}
              onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
              onMouseDown={(e) => { e.preventDefault(); onInsert(r + 1, c + 1) }}
              className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${
                r < hover.r && c < hover.c ? 'bg-primary/30 border-primary/40' : 'bg-slate-50 border-slate-200'
              }`}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────── */
const RichTextEditor = forwardRef(function RichTextEditor(
  { isEditing = false, defaultHtml = '', minHeight = '260px', stickyToolbar = false, onChange },
  ref,
) {
  const editorRef    = useRef(null)
  const imgInputRef  = useRef(null)
  const savedRangeRef = useRef(null)

  const [activePopover, setActivePopover] = useState(null)
  const [textColor,     setTextColor]     = useState('#000000')
  const [bgColor,       setBgColor]       = useState('transparent')
  const [fontSize,      setFontSize]      = useState(14)
  const [linkUrl,       setLinkUrl]       = useState('')
  const [mathExpr,      setMathExpr]      = useState('')
  const [selectedImg,   setSelectedImg]   = useState(null)
  const [imgWidthPct,   setImgWidthPct]   = useState(100)
  const [showAnnotate,  setShowAnnotate]  = useState(false)

  /* Expose innerHTML to parent via ref */
  useImperativeHandle(ref, () => ({
    get innerHTML() { return editorRef.current?.innerHTML ?? '' },
    set innerHTML(html) { if (editorRef.current) editorRef.current.innerHTML = html },
  }))

  /* Seed content */
  useEffect(() => {
    if (editorRef.current && defaultHtml)
      editorRef.current.innerHTML = defaultHtml
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isEditing) document.execCommand('styleWithCSS', false, true)
  }, [isEditing])

  useEffect(() => {
    function handler(e) {
      if (!e.target.closest('[data-popover-root]')) setActivePopover(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isEditing) setSelectedImg(null)
  }, [isEditing])

  useEffect(() => {
    if (selectedImg) {
      const w = selectedImg.style.width
      setImgWidthPct(w ? parseInt(w) : 100)
    }
  }, [selectedImg])

  /* ── Core helpers ── */
  function exec(cmd, val = null) {
    editorRef.current?.focus()
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(cmd, false, val)
  }
  function saveSelection() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange()
  }
  function restoreSelection() {
    const sel = window.getSelection()
    if (savedRangeRef.current) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current) }
  }
  function togglePopover(name) { saveSelection(); setActivePopover((v) => (v === name ? null : name)) }

  /* ── Format handlers ── */
  function applyTextColor(c) {
    setTextColor(c); editorRef.current?.focus(); restoreSelection()
    exec('foreColor', c); setActivePopover(null)
  }
  function applyBgColor(c) {
    setBgColor(c); editorRef.current?.focus(); restoreSelection()
    if (c === 'transparent') exec('removeFormat'); else exec('backColor', c)
    setActivePopover(null)
  }
  function applyHeading(tag) { exec('formatBlock', tag); setActivePopover(null) }

  function applyFontSizePx(px) {
    const size = Math.max(6, Math.min(120, Number(px)))
    if (!size) return
    setFontSize(size)
    editorRef.current?.focus()
    document.execCommand('styleWithCSS', false, false)
    document.execCommand('fontSize', false, '7')
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement('span')
      span.style.fontSize = size + 'px'
      span.innerHTML = el.innerHTML
      el.replaceWith(span)
    })
  }

  function applyLink() {
    const url = linkUrl.trim(); if (!url) return
    editorRef.current?.focus(); restoreSelection()
    exec('createLink', url.startsWith('http') ? url : 'https://' + url)
    setLinkUrl(''); setActivePopover(null)
  }

  function insertTable(rows, cols) {
    const td  = 'border:1px solid #cbd5e1;padding:6px 10px;min-width:60px;'
    const trs = Array(rows).fill(Array(cols).fill(`<td style="${td}">&nbsp;</td>`).join('')).map((c) => `<tr>${c}</tr>`).join('')
    editorRef.current?.focus(); restoreSelection()
    exec('insertHTML', `<table style="border-collapse:collapse;margin:8px 0;width:100%">${trs}</table><p><br></p>`)
    setActivePopover(null)
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      editorRef.current?.focus(); restoreSelection()
      exec('insertHTML', `<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;border-radius:6px;margin:8px 0;" />`)
    }
    reader.readAsDataURL(file); e.target.value = ''
  }

  function insertMath() {
    const expr = mathExpr.trim(); if (!expr) return
    const result  = tryEval(expr)
    const display = result !== null ? `${expr} = ${result}` : expr
    const html = `<span contenteditable="false" style="display:inline-flex;align-items:center;background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:1px 8px;font-family:ui-monospace,monospace;font-size:0.82em;color:#1d4ed8;margin:0 2px;white-space:nowrap;">${display}</span>&nbsp;`
    editorRef.current?.focus(); restoreSelection()
    exec('insertHTML', html); setMathExpr(''); setActivePopover(null)
  }

  function applyImgWidth(pct) {
    setImgWidthPct(pct)
    if (!selectedImg) return
    selectedImg.style.width  = pct + '%'
    selectedImg.style.height = 'auto'
  }
  function applyImgAlign(align) {
    if (!selectedImg) return
    selectedImg.style.float       = align === 'center' ? 'none' : align
    selectedImg.style.marginLeft  = align === 'center' ? 'auto' : align === 'left'  ? '0' : '16px'
    selectedImg.style.marginRight = align === 'center' ? 'auto' : align === 'right' ? '0' : '16px'
    selectedImg.style.display     = align === 'center' ? 'block' : 'inline'
  }
  function handleEditorClick(e) {
    if (!isEditing) return
    setSelectedImg(e.target.tagName === 'IMG' ? e.target : null)
  }

  /* ── Toolbar JSX ── */
  const toolbar = isEditing && (
    <div className={`border-b border-slate-200 bg-slate-50 ${stickyToolbar ? 'sticky top-0 z-10' : ''}`}>
      {/* Row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-slate-100">
        {/* Heading */}
        <div className="relative" data-popover-root>
          <button onMouseDown={(e) => { e.preventDefault(); togglePopover('heading') }}
            className="h-7 px-2 flex items-center gap-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors shrink-0">
            <span style={{ fontSize: '13px' }}>Normal</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_more</span>
          </button>
          {activePopover === 'heading' && (
            <Popover className="w-36">
              {HEADINGS.map(({ label, tag }) => (
                <button key={tag} onMouseDown={(e) => { e.preventDefault(); applyHeading(tag) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  style={{ fontWeight: tag !== 'p' ? 700 : 400, fontSize: tag === 'h1' ? '1.1em' : tag === 'h2' ? '1em' : '0.9em' }}>
                  {label}
                </button>
              ))}
            </Popover>
          )}
        </div>

        {/* Font size */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onMouseDown={(e) => { e.preventDefault(); applyFontSizePx(fontSize - 1) }}
            className="w-5 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
          </button>
          <input type="number" min={6} max={120} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            onBlur={(e) => applyFontSizePx(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFontSizePx(fontSize) } }}
            className="w-16 h-7 text-center text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onMouseDown={(e) => { e.preventDefault(); applyFontSizePx(fontSize + 1) }}
            className="w-5 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
          </button>
        </div>

        <Divider />
        <TBtn icon="format_bold"          title="Bold"          onMouseDown={(e) => { e.preventDefault(); exec('bold') }} />
        <TBtn icon="format_italic"        title="Italic"        onMouseDown={(e) => { e.preventDefault(); exec('italic') }} />
        <TBtn icon="format_underlined"    title="Underline"     onMouseDown={(e) => { e.preventDefault(); exec('underline') }} />
        <TBtn icon="format_strikethrough" title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough') }} />
        <Divider />
        <TBtn icon="subscript"   title="Subscript"   onMouseDown={(e) => { e.preventDefault(); exec('subscript') }} />
        <TBtn icon="superscript" title="Superscript" onMouseDown={(e) => { e.preventDefault(); exec('superscript') }} />
        <Divider />

        {/* Text color */}
        <div className="relative" data-popover-root>
          <button title="Text color" onMouseDown={(e) => { e.preventDefault(); togglePopover('textColor') }}
            className="w-7 h-7 flex flex-col items-center justify-center rounded text-slate-600 hover:bg-slate-200 transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>format_color_text</span>
            <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: textColor }} />
          </button>
          {activePopover === 'textColor' && <Popover><ColorPalette colors={TEXT_COLORS} onSelect={applyTextColor} /></Popover>}
        </div>

        {/* Background color */}
        <div className="relative" data-popover-root>
          <button title="Highlight" onMouseDown={(e) => { e.preventDefault(); togglePopover('bgColor') }}
            className="w-7 h-7 flex flex-col items-center justify-center rounded text-slate-600 hover:bg-slate-200 transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>border_color</span>
            <div className="w-4 h-0.5 rounded-full mt-0.5 border border-slate-300" style={{ background: bgColor === 'transparent' ? 'white' : bgColor }} />
          </button>
          {activePopover === 'bgColor' && <Popover><ColorPalette colors={BG_COLORS} onSelect={applyBgColor} /></Popover>}
        </div>

        <Divider />

        {/* Link */}
        <div className="relative" data-popover-root>
          <TBtn icon="link" title="Insert link" onMouseDown={(e) => { e.preventDefault(); togglePopover('link') }} active={activePopover === 'link'} />
          {activePopover === 'link' && (
            <Popover className="w-72 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Insert Link</p>
              <input autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyLink()}
                placeholder="https://example.com"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-300" />
              <div className="flex justify-end gap-1.5 mt-2">
                <button onMouseDown={(e) => { e.preventDefault(); setActivePopover(null) }} className="px-2.5 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onMouseDown={(e) => { e.preventDefault(); applyLink() }} className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90">Insert</button>
              </div>
            </Popover>
          )}
        </div>
        <TBtn icon="link_off" title="Remove link" onMouseDown={(e) => { e.preventDefault(); exec('unlink') }} />
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1">
        <TBtn icon="format_list_bulleted" title="Bullet list"   onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }} />
        <TBtn icon="format_list_numbered" title="Numbered list" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList') }} />
        <Divider />
        <TBtn icon="format_align_left"    title="Align left"    onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft') }} />
        <TBtn icon="format_align_center"  title="Align center"  onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter') }} />
        <TBtn icon="format_align_right"   title="Align right"   onMouseDown={(e) => { e.preventDefault(); exec('justifyRight') }} />
        <TBtn icon="format_align_justify" title="Justify"       onMouseDown={(e) => { e.preventDefault(); exec('justifyFull') }} />
        <Divider />

        {/* Table */}
        <div className="relative" data-popover-root>
          <TBtn icon="table_chart" title="Insert table" onMouseDown={(e) => { e.preventDefault(); togglePopover('table') }} active={activePopover === 'table'} />
          {activePopover === 'table' && <Popover><TablePicker onInsert={(r, c) => { insertTable(r, c); setActivePopover(null) }} /></Popover>}
        </div>

        {/* Image */}
        <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <TBtn icon="image" title="Upload image" onMouseDown={(e) => { e.preventDefault(); saveSelection(); imgInputRef.current?.click() }} />

        {/* Math */}
        <div className="relative" data-popover-root>
          <TBtn icon="calculate" title="Math expression" onMouseDown={(e) => { e.preventDefault(); togglePopover('math') }} active={activePopover === 'math'} />
          {activePopover === 'math' && (
            <Popover className="w-80 p-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Math Expression</p>
              <input autoFocus value={mathExpr} onChange={(e) => setMathExpr(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') insertMath(); if (e.key === 'Escape') setActivePopover(null) }}
                placeholder="e.g. C = n / V  or  50 * 0.001"
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-300" />
              {mathExpr.trim() && (
                <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] text-slate-400 mb-0.5">Preview</p>
                  <span className="text-xs font-mono text-blue-700">
                    {tryEval(mathExpr.trim()) !== null ? `${mathExpr.trim()} = ${tryEval(mathExpr.trim())}` : mathExpr.trim()}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {QUICK_FORMULAS.map((f) => (
                  <button key={f} onMouseDown={(e) => { e.preventDefault(); setMathExpr(f) }}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors">{f}</button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Numeric expressions auto-compute. Use <span className="font-mono">^</span> for exponents.</p>
              <div className="flex justify-end gap-1.5 mt-3">
                <button onMouseDown={(e) => { e.preventDefault(); setActivePopover(null) }} className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onMouseDown={(e) => { e.preventDefault(); insertMath() }} disabled={!mathExpr.trim()} className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40">Insert</button>
              </div>
            </Popover>
          )}
        </div>

        <Divider />
        <TBtn icon="undo" title="Undo" onMouseDown={(e) => { e.preventDefault(); exec('undo') }} />
        <TBtn icon="redo" title="Redo" onMouseDown={(e) => { e.preventDefault(); exec('redo') }} />
      </div>

      {/* Image control bar */}
      {selectedImg && (
        <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 border-t border-blue-100">
          <span className="material-symbols-outlined text-blue-400 shrink-0" style={{ fontSize: '16px' }}>image</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider shrink-0">Image</span>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] text-slate-500 shrink-0">Width</span>
            <input type="range" min={10} max={100} step={5} value={imgWidthPct}
              onChange={(e) => applyImgWidth(Number(e.target.value))}
              className="flex-1 accent-primary h-1" />
            <span className="text-xs font-mono text-slate-600 w-8 shrink-0">{imgWidthPct}%</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[25, 50, 75, 100].map((pct) => (
              <button key={pct} onClick={() => applyImgWidth(pct)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${imgWidthPct === pct ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {pct}%
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {[['left','format_align_left'],['center','format_align_center'],['right','format_align_right']].map(([align, icon]) => (
              <button key={align} title={`Align ${align}`} onClick={() => applyImgAlign(align)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAnnotate(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>draw</span>
            Annotate
          </button>
          <button onClick={() => setSelectedImg(null)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {toolbar}
      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={() => onChange?.()}
        onClick={handleEditorClick}
        style={{ minHeight }}
        className={`px-8 py-6 focus:outline-none text-sm leading-relaxed
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mt-5 [&_h1]:mb-2
          [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1.5
          [&_p]:text-slate-600 [&_p]:mb-3
          [&_a]:text-primary [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul_li]:mb-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li]:mb-1
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-3
          [&_td]:border [&_td]:border-slate-300 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-xs
          [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2
          ${isEditing ? 'bg-white cursor-text' : 'bg-white'}`}
      />

      {showAnnotate && selectedImg && (
        <ImageAnnotateModal
          src={selectedImg.src}
          onSave={(dataUrl) => { selectedImg.src = dataUrl; setShowAnnotate(false) }}
          onClose={() => setShowAnnotate(false)}
        />
      )}
    </>
  )
})

export default RichTextEditor
