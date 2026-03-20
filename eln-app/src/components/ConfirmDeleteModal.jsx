/**
 * ConfirmDeleteModal — reusable delete confirmation dialog.
 *
 * Props:
 *   title    {string}  — e.g. "Delete Material"
 *   message  {string}  — confirmation message
 *   onConfirm {fn}     — called when user confirms
 *   onCancel  {fn}     — called when user cancels
 */
export default function ConfirmDeleteModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Icon + header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-red-500" style={{ fontSize: '22px' }}>delete_forever</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
