import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Scene, Hotspot } from '@/types/database'
import PanoramaViewer from '@/components/builder/PanoramaViewer'
import HotspotOverlay from '@/components/player/HotspotOverlay'

function pitchYawToPercent(pitch: number, yaw: number): { x: number; y: number } {
  return {
    x: ((yaw + Math.PI) / (2 * Math.PI)) * 100,
    y: ((Math.PI / 2 - pitch) / Math.PI) * 100,
  }
}

export default function Player() {
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams] = useSearchParams()
  const isIglooMode = searchParams.get('mode') === 'igloo'

  const [scenes, setScenes] = useState<Scene[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return
    const fetchData = async () => {
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index')

      if (scenesError || !scenesData?.length) {
        setError('Project not found')
        setLoading(false)
        return
      }

      setScenes(scenesData)

      const sceneIds = scenesData.map(s => s.id)
      const { data: hotspotsData } = await supabase
        .from('hotspots')
        .select('*')
        .in('scene_id', sceneIds)

      setHotspots(hotspotsData || [])
      setLoading(false)
    }
    fetchData()
  }, [projectId])

  const activeScene = scenes[activeSceneIndex] ?? null
  const activeHotspots = hotspots.filter(h => h.scene_id === activeScene?.id)

  const handleHotspotClick = useCallback((hotspotId: string) => {
    const hotspot = hotspots.find(h => h.id === hotspotId)
    if (hotspot) setSelectedHotspot(hotspot)
  }, [hotspots])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedHotspot(null)
      if (e.key === 'ArrowRight' && scenes.length > 1) {
        setActiveSceneIndex(i => (i + 1) % scenes.length)
        setSelectedHotspot(null)
      }
      if (e.key === 'ArrowLeft' && scenes.length > 1) {
        setActiveSceneIndex(i => (i - 1 + scenes.length) % scenes.length)
        setSelectedHotspot(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scenes.length])

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !activeScene) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <p className="text-white/50">{error || 'No scenes found'}</p>
      </div>
    )
  }

  // Equirectangular flat mode for Igloo
  if (isIglooMode) {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden relative">
        {activeScene.image_url && (
          <img
            src={activeScene.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}

        {/* Hotspot markers as 2D positioned elements */}
        {activeHotspots.map(hotspot => {
          const pos = pitchYawToPercent(hotspot.pitch, hotspot.yaw)
          const isSelected = selectedHotspot?.id === hotspot.id
          return (
            <button
              key={hotspot.id}
              onClick={() => setSelectedHotspot(isSelected ? null : hotspot)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                isSelected
                  ? 'bg-blue-500 border-blue-300 scale-125'
                  : 'bg-white/80 border-white hover:bg-blue-400 hover:border-blue-300 hover:scale-110'
              }`} />
              <div className={`absolute w-8 h-8 -top-1.5 -left-1.5 rounded-full border border-white/30 animate-ping ${
                isSelected ? 'hidden' : ''
              }`} />
            </button>
          )
        })}

        {/* Overlay positioned above the selected hotspot */}
        {selectedHotspot && (() => {
          const pos = pitchYawToPercent(selectedHotspot.pitch, selectedHotspot.yaw)
          return (
            <div
              className="absolute -translate-x-1/2 pointer-events-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, calc(-100% - 24px))` }}
            >
              <div className="pointer-events-none">
                <HotspotOverlay
                  hotspot={selectedHotspot}
                  onClose={() => setSelectedHotspot(null)}
                />
              </div>
            </div>
          )
        })()}

        {/* Scene navigation pills */}
        {scenes.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40">
            {scenes.map((scene, i) => (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneIndex(i)
                  setSelectedHotspot(null)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === activeSceneIndex
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {scene.title}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Scrollable perspective mode (existing)
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <PanoramaViewer
        imageUrl={activeScene.image_url}
        hotspots={activeHotspots}
        placementMode={false}
        selectedHotspotId={selectedHotspot?.id ?? null}
        onHotspotClick={handleHotspotClick}
        overlayContent={
          selectedHotspot ? (
            <HotspotOverlay
              hotspot={selectedHotspot}
              onClose={() => setSelectedHotspot(null)}
            />
          ) : undefined
        }
      />

      {/* Scene navigation pills */}
      {scenes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {scenes.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => {
                setActiveSceneIndex(i)
                setSelectedHotspot(null)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === activeSceneIndex
                  ? 'bg-white text-black'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {scene.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
