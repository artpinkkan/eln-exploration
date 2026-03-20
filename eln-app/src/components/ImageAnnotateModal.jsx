import { useState, useRef, useEffect } from 'react'

const COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
]
const STROKE_SIZES = [2, 4, 8]
const TOOLS = [
  { id: 'pencil',    icon: 'edit',            title: 'Pencil'     },
  { id: 'highlight', icon: 'ink_highlighter', title: 'Highlight'  },
  { id: 'eraser',    icon: 'ink_eraser',      title: 'Eraser'     },
  { id: 'text',      icon: 'text_fields',     title: 'Text'       },
  { id: 'rect',      icon: 'rectangle',       title: 'Rectangle'  },
  { id: 'ellipse',   icon: 'circle',          title: 'Ellipse'    },
  { id: 'arrow',     icon: 'arrow_forward',   title: 'Arrow'      },
]

function drawArrow(ctx, x1, y1, x2, y2) {
  const head = 14
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

export default function ImageAnnotateModal({ src, onSave, onClose }) {
  const canvasRef      = useRef(null)
  const containerRef   = useRef(null)
  const textInputRef   = useRef(null)

  const [tool,       setTool]       = useState('pencil')
  const [color,      setColor]      = useState('#ef4444')
  const [strokeSize, setStrokeSize] = useState(3)
  const [history,    setHistory]    = useState([])
  const [isDrawing,  setIsDrawing]  = useState(false)
  const [startPos,   setStartPos]   = useState({ x: 0, y: 0 })
  const [snapshot,   setSnapshot]   = useState(null)
  const [imgDims,    setImgDims]    = useState(null)  // { w, h, nw, nh }
  const [textPos,    setTextPos]    = useState(null)
  const [textValue,  setTextValue]  = useState('')

  /* ── Compute display dimensions ── */
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const maxW = Math.min(img.naturalWidth, 860)
      const maxH = window.innerHeight * 0.6
      const h = img.naturalHeight * (maxW / img.naturalWidth)
      if (h <= maxH) {
        setImgDims({ w: maxW, h, nw: img.naturalWidth, nh: img.naturalHeight })
      } else {
        const scale = maxH / img.naturalHeight
        setImgDims({ w: img.naturalWidth * scale, h: maxH, nw: img.naturalWidth, nh: img.naturalHeight })
      }
    }
    img.src = src
  }, [src])

  /* ── Init canvas ── */
  useEffect(() => {
    if (!imgDims || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width  = imgDims.w
    canvas.height = imgDims.h
    canvas.getContext('2d').clearRect(0, 0, imgDims.w, imgDims.h)
  }, [imgDims])

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = canvasRef.current.width  / rect.width
    const sy = canvasRef.current.height / rect.height
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy }
  }

  function pushHistory() {
    const ctx = canvasRef.current.getContext('2d')
    setHistory((h) => [
      ...h.slice(-19),
      ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
    ])
  }

  function undo() {
    if (!history.length) return
    canvasRef.current.getContext('2d').putImageData(history[history.length - 1], 0, 0)
    setHistory((h) => h.slice(0, -1))
  }

  function clearCanvas() {
    pushHistory()
    const { width, height } = canvasRef.current
    canvasRef.current.getContext('2d').clearRect(0, 0, width, height)
  }

  function applyCtx(ctx) {
    ctx.lineCap  = 'round'
    ctx.lineJoin = 'round'
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth   = strokeSize * 5
    } else if (tool === 'highlight') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color + '55'
      ctx.lineWidth   = strokeSize * 6
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.fillStyle   = color
      ctx.lineWidth   = strokeSize
    }
  }

  function onMouseDown(e) {
    if (e.button !== 0) return
    const pos = getPos(e)
    if (tool === 'text') { setTextPos(pos); setTextValue(''); return }
    pushHistory()
    setIsDrawing(true)
    setStartPos(pos)
    const ctx = canvasRef.current.getContext('2d')
    if (['pencil', 'highlight', 'eraser'].includes(tool)) {
      applyCtx(ctx)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
    if (['rect', 'ellipse', 'arrow'].includes(tool)) {
      setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height))
    }
  }

  function onMouseMove(e) {
    if (!isDrawing) return
    const pos = getPos(e)
    const ctx = canvasRef.current.getContext('2d')
    if (['pencil', 'highlight', 'eraser'].includes(tool)) {
      applyCtx(ctx)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (snapshot) {
      ctx.putImageData(snapshot, 0, 0)
      applyCtx(ctx)
      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y)
      } else if (tool === 'ellipse') {
        ctx.beginPath()
        ctx.ellipse(
          (startPos.x + pos.x) / 2, (startPos.y + pos.y) / 2,
          Math.abs(pos.x - startPos.x) / 2, Math.abs(pos.y - startPos.y) / 2,
          0, 0, Math.PI * 2,
        )
        ctx.stroke()
      } else if (tool === 'arrow') {
        drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y)
      }
    }
  }

  function onMouseUp() {
    setIsDrawing(false)
    setSnapshot(null)
    canvasRef.current?.getContext('2d')
      .then?.(() => {}) // noop
    if (canvasRef.current) {
      canvasRef.current.getContext('2d').globalCompositeOperation = 'source-over'
    }
  }

  function commitText() {
    if (!textValue.trim() || !textPos) { setTextPos(null); return }
    pushHistory()
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = color
    ctx.font = `bold ${strokeSize * 6 + 10}px sans-serif`
    ctx.fillText(textValue, textPos.x, textPos.y)
    setTextPos(null)
    setTextValue('')
  }

  function handleSave() {
    const offscreen = document.createElement('canvas')
    offscreen.width  = imgDims.nw
    offscreen.height = imgDims.nh
    const ctx = offscreen.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imgDims.nw, imgDims.nh)
      ctx.drawImage(canvasRef.current, 0, 0, imgDims.nw, imgDims.nh)
      onSave(offscreen.toDataURL('image/png'))
    }
    img.src = src
  }

  const panelW = imgDims ? Math.max(imgDims.w + 48, 560) : 560

  if (!imgDims) return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl px-8 py-6 text-sm text-slate-500 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
        Loading image…
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ width: panelW, maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '17px' }}>draw</span>
            Annotate Image
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Annotation toolbar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-wrap shrink-0">

          {/* Tools */}
          <div className="flex items-center gap-0.5">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                title={t.title}
                onClick={() => setTool(t.id)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  tool === t.id ? 'bg-primary/15 text-primary' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{t.icon}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-300 shrink-0" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  background: c,
                  boxShadow: c === '#ffffff' ? '0 0 0 1px #cbd5e1 inset' : undefined,
                }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c ? 'border-slate-600 scale-110' : 'border-transparent'
                }`}
              />
            ))}
            <label title="Custom color" className="cursor-pointer">
              <input type="color" className="sr-only" value={color} onChange={(e) => setColor(e.target.value)} />
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center hover:border-slate-600 transition-colors">
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '11px' }}>add</span>
              </div>
            </label>
          </div>

          <div className="w-px h-5 bg-slate-300 shrink-0" />

          {/* Stroke size */}
          <div className="flex items-center gap-1">
            {STROKE_SIZES.map((s) => (
              <button
                key={s}
                title={`Stroke size ${s}`}
                onClick={() => setStrokeSize(s)}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                  strokeSize === s ? 'bg-primary/15' : 'hover:bg-slate-200'
                }`}
              >
                <div
                  className="rounded-full bg-slate-700"
                  style={{ width: s * 2 + 2, height: s * 2 + 2 }}
                />
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-300 shrink-0" />

          {/* Undo / Clear */}
          <button
            onClick={undo}
            disabled={!history.length}
            title="Undo"
            className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>undo</span>
          </button>
          <button
            onClick={clearCanvas}
            title="Clear all annotations"
            className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>layers_clear</span>
          </button>
        </div>

        {/* Canvas */}
        <div className="overflow-auto flex-1 bg-slate-100 flex items-center justify-center p-4">
          <div
            ref={containerRef}
            className="relative select-none shadow-lg rounded"
            style={{ width: imgDims.w, height: imgDims.h }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 pointer-events-none rounded"
              style={{ width: imgDims.w, height: imgDims.h, objectFit: 'contain' }}
            />
            <canvas
              ref={canvasRef}
              width={imgDims.w}
              height={imgDims.h}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              className="absolute inset-0 rounded"
              style={{
                cursor:
                  tool === 'text'   ? 'text'      :
                  tool === 'eraser' ? 'cell'       : 'crosshair',
                touchAction: 'none',
              }}
            />
            {/* Floating text input */}
            {textPos && (
              <input
                ref={textInputRef}
                autoFocus
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitText()
                  if (e.key === 'Escape') setTextPos(null)
                }}
                onBlur={commitText}
                className="absolute bg-transparent border-b-2 border-dashed focus:outline-none"
                style={{
                  left: textPos.x,
                  top: textPos.y - (strokeSize * 6 + 10),
                  color,
                  fontSize: strokeSize * 6 + 10,
                  borderColor: color,
                  minWidth: 80,
                }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
          <p className="text-[10px] text-slate-400">
            Tip: click canvas with <span className="font-semibold">Text</span> tool to place text · <span className="font-semibold">Esc</span> to cancel text
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
            >
              Apply Annotation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
