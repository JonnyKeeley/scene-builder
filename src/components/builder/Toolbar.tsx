import { useState } from 'react'

interface ToolbarProps {
  projectTitle: string
  onProjectTitleChange: (title: string) => void
  placementMode: boolean
  onTogglePlacement: () => void
  onPreview: () => void
  onPreviewIgloo: () => void
  onBack: () => void
}

export default function Toolbar({
  projectTitle,
  onProjectTitleChange,
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
      {/* Project name — editable */}
      <div className="px-4 py-3 h-[44px] flex items-center">
        {expanded ? (
          <input
            type="text"
            value={projectTitle}
            onChange={e => onProjectTitleChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-zinc-50 focus:outline-none w-full truncate"
          />
        ) : (
          <div className="w-7 h-7 mx-auto rounded-lg bg-zinc-700/50 flex items-center justify-center">
            <span className="text-sm text-zinc-300 font-semibold">{projectTitle.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Back */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>}
        label="Back"
        expanded={expanded}
        onClick={onBack}
      />

      <div className="mx-4 h-px bg-zinc-800/50" />

      {/* Place Hotspot */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
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

      {/* Immersive */}
      <ToolButton
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>}
        label="Immersive"
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
