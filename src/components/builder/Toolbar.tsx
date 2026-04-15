import { useState } from 'react'

interface ToolbarProps {
  sceneTitle: string
  onSceneTitleChange: (title: string) => void
  placementMode: boolean
  onTogglePlacement: () => void
  onPreview: () => void
  onPreviewIgloo: () => void
  onBack: () => void
}

export default function Toolbar({
  sceneTitle,
  onSceneTitleChange,
  placementMode,
  onTogglePlacement,
  onPreview,
  onPreviewIgloo,
  onBack,
}: ToolbarProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="panel-glass flex flex-col items-stretch overflow-hidden transition-all duration-300 py-2"
      style={{ width: expanded ? 220 : 56, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Back */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>}
        label="Back"
        expanded={expanded}
        onClick={onBack}
      />

      {/* Scene title — fixed height so expand doesn't shift layout */}
      <div className="px-4 py-3 h-[52px] flex items-center">
        {expanded ? (
          <input
            type="text"
            value={sceneTitle}
            onChange={e => onSceneTitleChange(e.target.value)}
            className="bg-transparent text-zinc-50 text-sm font-medium focus:outline-none w-full truncate"
          />
        ) : (
          <div className="w-7 h-7 mx-auto rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <span className="text-sm text-zinc-300 font-semibold">{sceneTitle.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-zinc-800/50" />

      {/* Place Hotspot */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>}
        label={placementMode ? 'Placing...' : 'Place Hotspot'}
        expanded={expanded}
        onClick={onTogglePlacement}
        active={placementMode}
      />

      <div className="mx-4 h-px bg-zinc-800/50" />

      {/* Preview */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>}
        label="Preview"
        expanded={expanded}
        onClick={onPreview}
      />

      {/* Igloo */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>}
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
      className={`flex items-center gap-3 px-4 py-3 transition-all text-sm font-medium disabled:opacity-40 ${
        active
          ? 'text-teal-400 bg-teal-500/10'
          : accent
            ? 'text-teal-400 hover:bg-teal-500/10'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
      }`}
      title={!expanded ? label : undefined}
    >
      <span className="shrink-0 w-5 flex items-center justify-center">{icon}</span>
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
        expanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'
      }`}>
        {label}
      </span>
    </button>
  )
}
