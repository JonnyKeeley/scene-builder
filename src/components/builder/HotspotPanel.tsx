import { useRef } from 'react'
import type { Hotspot, MediaType } from '@/types/database'

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
      <div className="h-full bg-slate-850 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Hotspots
        </h3>
        {hotspots.length === 0 ? (
          <p className="text-sm text-slate-500">
            Click "Place Hotspot" in the toolbar, then click on the panorama to add one.
          </p>
        ) : (
          <div className="space-y-2">
            {hotspots.map(h => (
              <button
                key={h.id}
                onClick={() => onSelectHotspot(h.id)}
                className="w-full text-left px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm text-white transition-colors"
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
    <div className="h-full bg-slate-850 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onSelectHotspot(null)}
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
          Back
        </button>
        <button
          onClick={() => onDeleteHotspot(selectedHotspot.id)}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title</label>
          <input
            type="text"
            value={selectedHotspot.title}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Body</label>
          <textarea
            value={selectedHotspot.body || ''}
            onChange={e => onUpdateHotspot(selectedHotspot.id, { body: e.target.value || null })}
            rows={5}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Media type</label>
          <select
            value={selectedHotspot.media_type || ''}
            onChange={e => {
              const val = e.target.value as MediaType | ''
              onUpdateHotspot(selectedHotspot.id, {
                media_type: val || null,
                media_url: val ? selectedHotspot.media_url : null,
              })
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">None</option>
            <option value="image">Image</option>
            <option value="youtube">YouTube</option>
            <option value="video">Video</option>
          </select>
        </div>

        {selectedHotspot.media_type === 'youtube' && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">YouTube URL</label>
            <input
              type="url"
              value={selectedHotspot.media_url || ''}
              onChange={e => onUpdateHotspot(selectedHotspot.id, { media_url: e.target.value || null })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {(selectedHotspot.media_type === 'image' || selectedHotspot.media_type === 'video') && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {selectedHotspot.media_type === 'image' ? 'Image' : 'Video'} file
            </label>
            {selectedHotspot.media_url ? (
              <div className="space-y-2">
                {selectedHotspot.media_type === 'image' && (
                  <img src={selectedHotspot.media_url} alt="" className="w-full rounded" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {uploading ? 'Uploading...' : 'Replace file'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-6 border border-dashed border-slate-600 rounded text-sm text-slate-400 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50"
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

        <button
          onClick={() => onSelectHotspot(null)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors mt-2"
        >
          Done
        </button>
      </div>
    </div>
  )
}
