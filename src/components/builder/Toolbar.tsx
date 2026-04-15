import { useRef } from 'react'

interface ToolbarProps {
  sceneTitle: string
  onSceneTitleChange: (title: string) => void
  placementMode: boolean
  onTogglePlacement: () => void
  onUploadImage: (file: File) => void
  onPreview: () => void
  onPreviewIgloo: () => void
  onBack: () => void
  saving: boolean
  lastSaved: Date | null
  uploading: boolean
}

export default function Toolbar({
  sceneTitle,
  onSceneTitleChange,
  placementMode,
  onTogglePlacement,
  onUploadImage,
  onPreview,
  onPreviewIgloo,
  onBack,
  saving,
  lastSaved,
  uploading,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
        title="Back to dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
      </button>

      <input
        type="text"
        value={sceneTitle}
        onChange={e => onSceneTitleChange(e.target.value)}
        className="bg-transparent border-none text-zinc-50 font-medium text-sm focus:outline-none focus:bg-zinc-800 px-2 py-1 rounded-md w-48 transition-all"
      />

      <div className="h-4 w-px bg-zinc-800" />

      <button
        onClick={onTogglePlacement}
        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all active:scale-[0.98] ${
          placementMode
            ? 'bg-teal-500 text-white'
            : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800'
        }`}
      >
        {placementMode ? 'Placing...' : 'Place Hotspot'}
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-all disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload 360 Image'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onUploadImage(file)
          e.target.value = ''
        }}
        className="hidden"
      />

      <div className="flex-1" />

      {/* Save indicator */}
      <div className="flex items-center gap-1.5">
        {saving ? (
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        ) : lastSaved ? (
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500/50" />
        ) : null}
        <span className="text-xs text-zinc-600">
          {saving ? 'Saving' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>
      </div>

      <button
        onClick={onPreview}
        className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-all"
      >
        Preview
      </button>
      <button
        onClick={onPreviewIgloo}
        className="px-3 py-1.5 text-sm text-teal-400 border border-teal-500/30 hover:bg-teal-500/10 rounded-md font-medium transition-all active:scale-[0.98]"
      >
        Igloo
      </button>
    </div>
  )
}
