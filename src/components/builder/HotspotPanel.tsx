import { useRef } from 'react'
import type { Hotspot, MediaType, ChartData } from '@/types/database'
import ChartEditor from './ChartEditor'

const MEDIA_OPTIONS: { value: MediaType | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'image', label: 'Image' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'video', label: 'Video' },
  { value: 'chart', label: 'Chart' },
]

interface HotspotPanelProps {
  hotspots: Hotspot[]
  selectedHotspot: Hotspot | null
  onSelectHotspot: (id: string | null) => void
  onUpdateHotspot: (id: string, updates: Partial<Hotspot>) => void
  onDeleteHotspot: (id: string) => void
  onUploadMedia: (hotspotId: string, file: File) => void
  uploading: boolean
}

export default function HotspotPanel({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onUpdateHotspot,
  onDeleteHotspot,
  onUploadMedia,
  uploading,
}: HotspotPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!selectedHotspot) {
    return (
      <div className="h-full p-5 overflow-y-auto">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Hotspots
        </p>
        {hotspots.length === 0 ? (
          <p className="text-sm text-zinc-500 leading-relaxed">
            Press <kbd className="font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">H</kbd> or use the toolbar to place hotspots.
          </p>
        ) : (
          <div className="space-y-1.5">
            {hotspots.map(h => (
              <button
                key={h.id}
                onClick={() => onSelectHotspot(h.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/60 transition-all"
              >
                {h.title}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onSelectHotspot(null)}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          All hotspots
        </button>
        <button
          onClick={() => onDeleteHotspot(selectedHotspot.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Delete hotspot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
          <input
            type="text"
            value={selectedHotspot.title}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { title: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-base text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all placeholder:text-zinc-600"
            placeholder="Hotspot title"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Description</label>
          <textarea
            value={selectedHotspot.body || ''}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { body: e.target.value || null })}
            rows={4}
            className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all resize-none leading-relaxed placeholder:text-zinc-600"
            placeholder="Add a description..."
          />
        </div>

        {/* Media type — pill selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            Media
          </label>
          <div className="flex flex-wrap gap-2">
            {MEDIA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  const val = opt.value as MediaType | ''
                  onUpdateHotspot(selectedHotspot.id, {
                    media_type: val || null,
                    media_url: val ? selectedHotspot.media_url : null,
                  })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  (selectedHotspot.media_type || '') === opt.value
                    ? 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {selectedHotspot.media_type === 'youtube' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">YouTube URL</label>
            <input
              type="url"
              value={selectedHotspot.media_url || ''}
              onChange={e => onUpdateHotspot(selectedHotspot.id, { media_url: e.target.value || null })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
            />
          </div>
        )}

        {(selectedHotspot.media_type === 'image' || selectedHotspot.media_type === 'video') && (
          <div>
            {selectedHotspot.media_url ? (
              <div className="space-y-3">
                {selectedHotspot.media_type === 'image' && (
                  <img src={selectedHotspot.media_url} alt="" className="w-full rounded-xl" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 rounded-lg transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Replace file'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-10 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center gap-3 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/20 transition-all disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <span className="text-sm font-medium">{uploading ? 'Uploading...' : `Add ${selectedHotspot.media_type}`}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={selectedHotspot.media_type === 'image' ? 'image/*' : 'video/*'}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) onUploadMedia(selectedHotspot.id, file)
                e.target.value = ''
              }}
              className="hidden"
            />
          </div>
        )}

        {selectedHotspot.media_type === 'chart' && (
          <ChartEditor
            value={selectedHotspot.media_url ? (() => { try { return JSON.parse(selectedHotspot.media_url) as ChartData } catch { return null } })() : null}
            onChange={(chartData) => onUpdateHotspot(selectedHotspot.id, { media_url: JSON.stringify(chartData) })}
          />
        )}

        <button
          onClick={() => onSelectHotspot(null)}
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98] mt-2"
        >
          Done
        </button>
      </div>
    </div>
  )
}
