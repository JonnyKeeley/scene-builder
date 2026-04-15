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
      <div className="h-full p-4 overflow-y-auto scroll-mask">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.08em] mb-4">
          Hotspots
        </p>
        {hotspots.length === 0 ? (
          <p className="text-[12px] text-zinc-600 leading-relaxed">
            Press <kbd className="font-mono-caption px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">H</kbd> or use the toolbar to place hotspots.
          </p>
        ) : (
          <div className="space-y-1">
            {hotspots.map(h => (
              <button
                key={h.id}
                onClick={() => onSelectHotspot(h.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
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
    <div className="h-full p-4 overflow-y-auto scroll-mask">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onSelectHotspot(null)}
          className="text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          All hotspots
        </button>
        <button
          onClick={() => onDeleteHotspot(selectedHotspot.id)}
          className="text-[11px] text-zinc-600 hover:text-red-400 px-2 py-1 rounded-md transition-all"
        >
          Delete
        </button>
      </div>

      <div className="space-y-5">
        {/* Title — invisible border until focus */}
        <div>
          <input
            type="text"
            value={selectedHotspot.title}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { title: e.target.value })}
            className="w-full bg-transparent text-zinc-50 text-[15px] font-semibold focus:outline-none focus:bg-zinc-800/30 px-2 py-1 -mx-2 rounded-lg transition-all placeholder:text-zinc-600"
            placeholder="Hotspot title"
          />
        </div>

        {/* Body — invisible border until focus */}
        <div>
          <textarea
            value={selectedHotspot.body || ''}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { body: e.target.value || null })}
            rows={4}
            className="w-full bg-transparent text-[13px] text-zinc-400 focus:outline-none focus:bg-zinc-800/30 px-2 py-1.5 -mx-2 rounded-lg transition-all resize-none leading-relaxed placeholder:text-zinc-600"
            placeholder="Add a description..."
          />
        </div>

        {/* Media type — pill selector */}
        <div>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.08em] mb-2">
            Media
          </p>
          <div className="flex flex-wrap gap-1">
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
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                  (selectedHotspot.media_type || '') === opt.value
                    ? 'bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {selectedHotspot.media_type === 'youtube' && (
          <div>
            <input
              type="url"
              value={selectedHotspot.media_url || ''}
              onChange={e => onUpdateHotspot(selectedHotspot.id, { media_url: e.target.value || null })}
              placeholder="Paste YouTube URL..."
              className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
            />
          </div>
        )}

        {(selectedHotspot.media_type === 'image' || selectedHotspot.media_type === 'video') && (
          <div>
            {selectedHotspot.media_url ? (
              <div className="space-y-2">
                {selectedHotspot.media_type === 'image' && (
                  <img src={selectedHotspot.media_url} alt="" className="w-full rounded-lg" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-[12px] text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Replace file'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-8 border border-dashed border-zinc-700/50 rounded-lg text-[12px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Choose ${selectedHotspot.media_type} file`}
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
      </div>
    </div>
  )
}
