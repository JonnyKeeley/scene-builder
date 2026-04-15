import { useRef, useState } from 'react'

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
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="panel-glass flex flex-col items-stretch overflow-hidden transition-all duration-300"
      style={{ width: expanded ? 200 : 48, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Save dot */}
      <div className="absolute top-2 right-2">
        {saving ? (
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        ) : lastSaved ? (
          <div className="w-2 h-2 rounded-full bg-teal-500/40" />
        ) : null}
      </div>

      {/* Back */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>}
        label="Back"
        expanded={expanded}
        onClick={onBack}
      />

      {/* Scene title */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={sceneTitle}
          onChange={e => onSceneTitleChange(e.target.value)}
          className={`bg-transparent text-zinc-50 text-[13px] font-medium focus:outline-none w-full truncate ${
            expanded ? '' : 'opacity-0 pointer-events-none h-0 py-0'
          }`}
        />
        {!expanded && (
          <div className="w-5 h-5 mx-auto rounded bg-zinc-700/50 flex items-center justify-center">
            <span className="text-[10px] text-zinc-400 font-medium">{sceneTitle.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="mx-3 h-px bg-zinc-800/50" />

      {/* Place Hotspot */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>}
        label={placementMode ? 'Placing...' : 'Place Hotspot'}
        expanded={expanded}
        onClick={onTogglePlacement}
        active={placementMode}
      />

      {/* Upload 360 */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>}
        label={uploading ? 'Uploading...' : 'Upload 360°'}
        expanded={expanded}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      />
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

      <div className="mx-3 h-px bg-zinc-800/50" />

      {/* Preview */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>}
        label="Preview"
        expanded={expanded}
        onClick={onPreview}
      />

      {/* Igloo */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>}
        label="Igloo"
        expanded={expanded}
        onClick={onPreviewIgloo}
        accent
      />
    </div>
  )
}

function ToolButton({
  icon,
  label,
  expanded,
  onClick,
  active,
  disabled,
  accent,
}: {
  icon: React.ReactNode
  label: string
  expanded: boolean
  onClick: () => void
  active?: boolean
  disabled?: boolean
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2.5 transition-all text-[13px] font-medium disabled:opacity-40 ${
        active
          ? 'text-teal-400 bg-teal-500/10'
          : accent
            ? 'text-teal-400 hover:bg-teal-500/10'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
      }`}
      title={!expanded ? label : undefined}
    >
      <span className="shrink-0 w-[18px] flex items-center justify-center">{icon}</span>
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
        expanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
      }`}>
        {label}
      </span>
    </button>
  )
}
