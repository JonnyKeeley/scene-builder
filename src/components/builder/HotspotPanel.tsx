import { useRef } from 'react'
import type { Hotspot, MediaType, ChartData } from '@/types/database'
import ChartEditor from './ChartEditor'

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
      <div className="h-full bg-zinc-900 p-4 overflow-y-auto">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
          Hotspots
        </h3>
        {hotspots.length === 0 ? (
          <p className="text-xs text-zinc-600 leading-relaxed">
            Click "Place Hotspot" in the toolbar, then click on the panorama to add one.
          </p>
        ) : (
          <div className="space-y-1">
            {hotspots.map(h => (
              <button
                key={h.id}
                onClick={() => onSelectHotspot(h.id)}
                className="w-full text-left px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 hover:text-zinc-50 transition-all"
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
    <div className="h-full bg-zinc-900 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onSelectHotspot(null)}
          className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          Back
        </button>
        <button
          onClick={() => onDeleteHotspot(selectedHotspot.id)}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-md transition-all"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Title</label>
          <input
            type="text"
            value={selectedHotspot.title}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { title: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Body</label>
          <textarea
            value={selectedHotspot.body || ''}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { body: e.target.value || null })}
            rows={5}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Media type</label>
          <select
            value={selectedHotspot.media_type || ''}
            onChange={e => {
              const val = e.target.value as MediaType | ''
              onUpdateHotspot(selectedHotspot.id, {
                media_type: val || null,
                media_url: val ? selectedHotspot.media_url : null,
              })
            }}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
          >
            <option value="">None</option>
            <option value="image">Image</option>
            <option value="youtube">YouTube</option>
            <option value="video">Video</option>
            <option value="chart">Chart</option>
          </select>
        </div>

        {selectedHotspot.media_type === 'youtube' && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">YouTube URL</label>
            <input
              type="url"
              value={selectedHotspot.media_url || ''}
              onChange={e => onUpdateHotspot(selectedHotspot.id, { media_url: e.target.value || null })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
            />
          </div>
        )}

        {(selectedHotspot.media_type === 'image' || selectedHotspot.media_type === 'video') && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              {selectedHotspot.media_type === 'image' ? 'Image' : 'Video'} file
            </label>
            {selectedHotspot.media_url ? (
              <div className="space-y-2">
                {selectedHotspot.media_type === 'image' && (
                  <img src={selectedHotspot.media_url} alt="" className="w-full rounded-md" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Replace file'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-6 border border-dashed border-zinc-700 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Choose file'}
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
          className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-md font-medium transition-all active:scale-[0.98] mt-2"
        >
          Done
        </button>
      </div>
    </div>
  )
}
