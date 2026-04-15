interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onCancel}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full mx-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-zinc-50 mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
