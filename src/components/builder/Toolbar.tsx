import { useRef } from 'react'

interface ToolbarProps {
  sceneTitle: string
  onSceneTitleChange: (title: string) => void
  placementMode: boolean
  onTogglePlacement: () => void
  onUploadImage: (file: File) => void
  onPreview: () => void
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
  onBack,
  saving,
  lastSaved,
  uploading,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveStatus = saving
    ? 'Saving...'
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : ''

  return (
    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 shrink-0">
      <button
        onClick={onBack}
        className="text-slate-400 hover:text-white transition-colors mr-1"
        title="Back to dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
      </button>

      <input
        type="text"
        value={sceneTitle}
        onChange={e => onSceneTitleChange(e.target.value)}
        className="bg-transparent border-none text-white font-medium text-sm focus:outline-none focus:bg-slate-700 px-2 py-1 rounded w-48"
      />

      <div className="h-5 w-px bg-slate-700" />

      <button
        onClick={onTogglePlacement}
        className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
          placementMode
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        {placementMode ? 'Placing...' : 'Place Hotspot'}
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
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

      <span className="text-xs text-slate-500">{saveStatus}</span>

      <button
        onClick={onPreview}
        className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
      >
        Preview
      </button>
    </div>
  )
}
