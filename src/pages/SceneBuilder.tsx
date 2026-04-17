import { useEffect, useReducer, useCallback, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { uploadPanorama, uploadMedia } from '@/lib/storage'
import { useAuth } from '@/hooks/useAuth'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { Project, Scene, Hotspot } from '@/types/database'
import PanoramaViewer from '@/components/builder/PanoramaViewer'
import Toolbar from '@/components/builder/Toolbar'
import SceneStrip from '@/components/builder/SceneStrip'
import HotspotPanel from '@/components/builder/HotspotPanel'

interface BuilderState {
  project: Project | null
  scenes: Scene[]
  hotspots: Record<string, Hotspot[]>
  activeSceneId: string | null
  selectedHotspotId: string | null
  placementMode: boolean
  loading: boolean
}

type Action =
  | { type: 'SET_DATA'; project: Project; scenes: Scene[]; hotspots: Record<string, Hotspot[]> }
  | { type: 'SET_ACTIVE_SCENE'; sceneId: string }
  | { type: 'SELECT_HOTSPOT'; hotspotId: string | null }
  | { type: 'TOGGLE_PLACEMENT' }
  | { type: 'ADD_HOTSPOT'; hotspot: Hotspot }
  | { type: 'UPDATE_HOTSPOT'; hotspotId: string; updates: Partial<Hotspot> }
  | { type: 'DELETE_HOTSPOT'; hotspotId: string }
  | { type: 'UPDATE_SCENE'; sceneId: string; updates: Partial<Scene> }
  | { type: 'ADD_SCENE'; scene: Scene }
  | { type: 'DELETE_SCENE'; sceneId: string }
  | { type: 'UPDATE_PROJECT_TITLE'; title: string }

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        project: action.project,
        scenes: action.scenes,
        hotspots: action.hotspots,
        activeSceneId: action.scenes[0]?.id ?? null,
        loading: false,
      }
    case 'SET_ACTIVE_SCENE':
      return { ...state, activeSceneId: action.sceneId, selectedHotspotId: null }
    case 'SELECT_HOTSPOT':
      return { ...state, selectedHotspotId: action.hotspotId, placementMode: false }
    case 'TOGGLE_PLACEMENT':
      return { ...state, placementMode: !state.placementMode, selectedHotspotId: null }
    case 'ADD_HOTSPOT': {
      const sceneId = action.hotspot.scene_id
      return {
        ...state,
        hotspots: {
          ...state.hotspots,
          [sceneId]: [...(state.hotspots[sceneId] || []), action.hotspot],
        },
        selectedHotspotId: action.hotspot.id,
        placementMode: false,
      }
    }
    case 'UPDATE_HOTSPOT': {
      const newHotspots = { ...state.hotspots }
      for (const sceneId of Object.keys(newHotspots)) {
        newHotspots[sceneId] = newHotspots[sceneId].map(h =>
          h.id === action.hotspotId ? { ...h, ...action.updates } : h
        )
      }
      return { ...state, hotspots: newHotspots }
    }
    case 'DELETE_HOTSPOT': {
      const newHotspots = { ...state.hotspots }
      for (const sceneId of Object.keys(newHotspots)) {
        newHotspots[sceneId] = newHotspots[sceneId].filter(h => h.id !== action.hotspotId)
      }
      return { ...state, hotspots: newHotspots, selectedHotspotId: null }
    }
    case 'UPDATE_SCENE':
      return {
        ...state,
        scenes: state.scenes.map(s =>
          s.id === action.sceneId ? { ...s, ...action.updates } : s
        ),
      }
    case 'ADD_SCENE':
      return {
        ...state,
        scenes: [...state.scenes, action.scene],
        hotspots: { ...state.hotspots, [action.scene.id]: [] },
        activeSceneId: action.scene.id,
        selectedHotspotId: null,
      }
    case 'DELETE_SCENE': {
      const remaining = state.scenes.filter(s => s.id !== action.sceneId)
      const newHotspots = { ...state.hotspots }
      delete newHotspots[action.sceneId]
      const newActiveId = state.activeSceneId === action.sceneId
        ? (remaining[0]?.id ?? null)
        : state.activeSceneId
      return {
        ...state,
        scenes: remaining,
        hotspots: newHotspots,
        activeSceneId: newActiveId,
        selectedHotspotId: null,
      }
    }
    case 'UPDATE_PROJECT_TITLE':
      return { ...state, project: state.project ? { ...state.project, title: action.title } : null }
    default:
      return state
  }
}

const initialState: BuilderState = {
  project: null,
  scenes: [],
  hotspots: {},
  activeSceneId: null,
  selectedHotspotId: null,
  placementMode: false,
  loading: true,
}

export default function SceneBuilder() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { uploading, upload } = useFileUpload()
  const [showInstruction, setShowInstruction] = useState(false)
  const emptyUploadRef = useRef<HTMLInputElement>(null)

  const activeScene = state.scenes.find(s => s.id === state.activeSceneId) ?? null
  const activeHotspots = state.activeSceneId ? (state.hotspots[state.activeSceneId] || []) : []
  const selectedHotspot = activeHotspots.find(h => h.id === state.selectedHotspotId) ?? null
  const panelOpen = !!state.selectedHotspotId

  // Show instruction when entering placement mode
  useEffect(() => {
    if (state.placementMode) {
      setShowInstruction(true)
      const timer = setTimeout(() => setShowInstruction(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShowInstruction(false)
    }
  }, [state.placementMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'h' || e.key === 'H') dispatch({ type: 'TOGGLE_PLACEMENT' })
      if (e.key === 'Escape') {
        if (state.placementMode) dispatch({ type: 'TOGGLE_PLACEMENT' })
        else if (state.selectedHotspotId) dispatch({ type: 'SELECT_HOTSPOT', hotspotId: null })
      }
      if (e.key === 'p' || e.key === 'P') window.open(`/play/${projectId}`, '_blank')
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1
        if (state.scenes[idx]) dispatch({ type: 'SET_ACTIVE_SCENE', sceneId: state.scenes[idx].id })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.placementMode, state.selectedHotspotId, state.scenes, projectId])

  // Fetch project data
  useEffect(() => {
    if (!projectId) return
    const fetchData = async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (!project) { navigate('/'); return }

      const { data: scenes } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index')

      const sceneIds = (scenes || []).map(s => s.id)
      const { data: hotspots } = sceneIds.length > 0
        ? await supabase.from('hotspots').select('*').in('scene_id', sceneIds)
        : { data: [] }

      const hotspotMap: Record<string, Hotspot[]> = {}
      for (const s of scenes || []) hotspotMap[s.id] = []
      for (const h of hotspots || []) {
        if (!hotspotMap[h.scene_id]) hotspotMap[h.scene_id] = []
        hotspotMap[h.scene_id].push(h)
      }

      dispatch({ type: 'SET_DATA', project, scenes: scenes || [], hotspots: hotspotMap })
    }
    fetchData()
  }, [projectId, navigate])

  useAutoSave(
    activeScene?.title ?? '',
    useCallback(async (title: string) => {
      if (!activeScene) return
      await supabase.from('scenes').update({ title }).eq('id', activeScene.id)
    }, [activeScene?.id])
  )

  useAutoSave(
    state.project?.title ?? '',
    useCallback(async (title: string) => {
      if (!projectId) return
      await supabase.from('projects').update({ title }).eq('id', projectId)
    }, [projectId])
  )

  useAutoSave(
    selectedHotspot,
    useCallback(async (hotspot: Hotspot | null) => {
      if (!hotspot) return
      await supabase.from('hotspots').update({
        title: hotspot.title, body: hotspot.body,
        media_url: hotspot.media_url, media_type: hotspot.media_type,
      }).eq('id', hotspot.id)
    }, [])
  )

  const handlePanoramaClick = useCallback(async (pitch: number, yaw: number) => {
    if (!state.activeSceneId) return
    setShowInstruction(false)
    const { data } = await supabase
      .from('hotspots')
      .insert({ scene_id: state.activeSceneId, pitch, yaw, title: 'New Hotspot' })
      .select().single()
    if (data) dispatch({ type: 'ADD_HOTSPOT', hotspot: data })
  }, [state.activeSceneId])

  const handleDeleteHotspot = useCallback(async (id: string) => {
    await supabase.from('hotspots').delete().eq('id', id)
    dispatch({ type: 'DELETE_HOTSPOT', hotspotId: id })
  }, [])

  const handleUploadImage = useCallback(async (file: File) => {
    if (!user || !activeScene) return
    const url = await upload(() => uploadPanorama(file, user.id))
    if (url) {
      await supabase.from('scenes').update({ image_url: url }).eq('id', activeScene.id)
      dispatch({ type: 'UPDATE_SCENE', sceneId: activeScene.id, updates: { image_url: url } })
    }
  }, [user, activeScene, upload])

  const handleAddScene = useCallback(async (file: File) => {
    if (!user || !projectId) return
    const url = await upload(() => uploadPanorama(file, user.id))
    if (!url) return
    const newIndex = state.scenes.length
    const { data } = await supabase
      .from('scenes')
      .insert({ project_id: projectId, title: `Scene ${newIndex + 1}`, image_url: url, order_index: newIndex })
      .select().single()
    if (data) dispatch({ type: 'ADD_SCENE', scene: data })
  }, [user, projectId, state.scenes.length, upload])

  const handleDeleteScene = useCallback(async (sceneId: string) => {
    await supabase.from('scenes').delete().eq('id', sceneId)
    dispatch({ type: 'DELETE_SCENE', sceneId })
  }, [])

  const handleReplaceImage = useCallback(async (sceneId: string, file: File) => {
    if (!user) return
    const url = await upload(() => uploadPanorama(file, user.id))
    if (url) {
      await supabase.from('scenes').update({ image_url: url }).eq('id', sceneId)
      dispatch({ type: 'UPDATE_SCENE', sceneId, updates: { image_url: url } })
    }
  }, [user, upload])

  const handleUploadMedia = useCallback(async (hotspotId: string, file: File) => {
    if (!user) return
    const url = await upload(() => uploadMedia(file, user.id))
    if (!url) return

    // Check if this hotspot is a gallery — append to array instead of replacing
    const hotspot = Object.values(state.hotspots).flat().find(h => h.id === hotspotId)
    if (hotspot?.media_type === 'gallery') {
      const existing: string[] = hotspot.media_url ? (() => { try { return JSON.parse(hotspot.media_url) } catch { return [] } })() : []
      const updated = JSON.stringify([...existing, url])
      dispatch({ type: 'UPDATE_HOTSPOT', hotspotId, updates: { media_url: updated } })
    } else {
      dispatch({ type: 'UPDATE_HOTSPOT', hotspotId, updates: { media_url: url } })
    }
  }, [user, upload, state.hotspots])

  if (state.loading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative">
      {/* Full-canvas panorama */}
      <div className={`absolute inset-0 vignette ${state.placementMode ? 'placement-active' : ''}`}>
        {!activeScene?.image_url ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl panel-glass flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                </svg>
              </div>
              <p className="text-sm text-zinc-400 mb-5">Upload a 360° image to get started</p>
              <button
                onClick={() => emptyUploadRef.current?.click()}
                disabled={uploading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              >
                {uploading ? 'Uploading...' : 'Upload 360° image'}
              </button>
              <input
                ref={emptyUploadRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleUploadImage(file)
                  e.target.value = ''
                }}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <PanoramaViewer
            imageUrl={activeScene.image_url}
            hotspots={activeHotspots}
            placementMode={state.placementMode}
            selectedHotspotId={state.selectedHotspotId}
            onPanoramaClick={handlePanoramaClick}
            onHotspotClick={id => dispatch({ type: 'SELECT_HOTSPOT', hotspotId: id })}
          />
        )}
      </div>

      {/* Floating toolbar — top left, vertical */}
      <div className={`absolute top-4 left-4 z-10 transition-opacity duration-300 ${state.placementMode ? '' : ''}`}>
        <Toolbar
          projectTitle={state.project?.title ?? ''}
          onProjectTitleChange={title => dispatch({ type: 'UPDATE_PROJECT_TITLE', title })}
          placementMode={state.placementMode}
          onTogglePlacement={() => dispatch({ type: 'TOGGLE_PLACEMENT' })}
          onPreview={() => window.open(`/play/${projectId}`, '_blank')}
          onPreviewIgloo={() => window.open(`/play/${projectId}?mode=igloo`, '_blank')}
          onPreviewWebGL={() => window.open(`/play/${projectId}?mode=webgl`, '_blank')}
          onBack={() => navigate('/')}
        />
      </div>

      {/* Placement mode instruction */}
      {showInstruction && (
        <div className="absolute top-4 left-20 z-10 animate-slide-up">
          <div className="panel-glass px-3 py-2 text-sm text-zinc-400">
            Click on the panorama to place a hotspot
          </div>
        </div>
      )}

      {/* Floating hotspot panel — right side, slides in/out */}
      <div
        className={`absolute top-4 right-4 bottom-32 z-10 w-96 transition-all duration-300 ${
          panelOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-8 opacity-0 pointer-events-none'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="panel-glass h-full overflow-hidden">
          <HotspotPanel
            hotspots={activeHotspots}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={id => dispatch({ type: 'SELECT_HOTSPOT', hotspotId: id })}
            onUpdateHotspot={(id, updates) => dispatch({ type: 'UPDATE_HOTSPOT', hotspotId: id, updates })}
            onDeleteHotspot={handleDeleteHotspot}
            onUploadMedia={handleUploadMedia}
            uploading={uploading}
          />
        </div>
      </div>

      {/* Floating scene strip — bottom centre */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <SceneStrip
          scenes={state.scenes}
          activeSceneId={state.activeSceneId}
          onSelectScene={id => dispatch({ type: 'SET_ACTIVE_SCENE', sceneId: id })}
          onAddScene={handleAddScene}
          onDeleteScene={handleDeleteScene}
          onReplaceImage={handleReplaceImage}
        />
      </div>
    </div>
  )
}
