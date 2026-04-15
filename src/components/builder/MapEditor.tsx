import { useState, useEffect } from 'react'
import type { MapData } from '@/types/database'

interface MapEditorProps {
  value: MapData | null
  onChange: (data: MapData) => void
}

const DEFAULT_MAP: MapData = { lat: 51.5074, lng: -0.1278, label: '' }

export default function MapEditor({ value, onChange }: MapEditorProps) {
  const [map, setMap] = useState<MapData>(value ?? DEFAULT_MAP)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (value) setMap(value)
  }, [value])

  const update = (partial: Partial<MapData>) => {
    const next = { ...map, ...partial }
    setMap(next)
    onChange(next)
  }

  const searchAddress = async () => {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`,
        { headers: { 'User-Agent': 'IglooSceneBuilder/1.0' } }
      )
      const data = await res.json()
      if (data[0]) {
        update({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: search })
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Search location</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchAddress()}
            placeholder="Enter address or place..."
            className="flex-1 px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
          />
          <button
            onClick={searchAddress}
            disabled={searching}
            className="px-4 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
          >
            {searching ? '...' : 'Find'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Pin label</label>
        <input
          type="text"
          value={map.label || ''}
          onChange={e => update({ label: e.target.value })}
          placeholder="Optional label for the pin..."
          className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Lat</label>
          <input
            type="number"
            step="any"
            value={map.lat}
            onChange={e => update({ lat: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all font-mono"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Lng</label>
          <input
            type="number"
            step="any"
            value={map.lng}
            onChange={e => update({ lng: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-sm text-zinc-50 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all font-mono"
          />
        </div>
      </div>

      {/* Preview map thumbnail */}
      <div className="rounded-xl overflow-hidden border border-zinc-800/60">
        <img
          src={`https://static-maps.yandex.ru/v1?ll=${map.lng},${map.lat}&z=14&size=400,200&l=map&pt=${map.lng},${map.lat},pm2rdl`}
          alt="Map preview"
          className="w-full h-32 object-cover bg-zinc-800"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    </div>
  )
}
