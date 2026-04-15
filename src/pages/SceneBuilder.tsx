import { useEffect, useReducer, useCallback } from 'react'
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

  const activeScene = state.scenes.find(s => s.id === state.activeSceneId) ?? null
  const activeHotspots = state.activeSceneId ? (state.hotspots[state.activeSceneId] || []) : []
  const selectedHotspot = activeHotspots.find(h => h.id === state.selectedHotspotId) ?? null

  // Fetch project data
  useEffect(() => {
    if (!projectId) return
    const fetchData = async () => {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (!project) {
        navigate('/')
        return
      }

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

  // Auto-save scene title
  const sceneTitleSave = useAutoSave(
    activeScene?.title ?? '',
    useCallback(async (title: string) => {
      if (!activeScene) return
      await supabase.from('scenes').update({ title }).eq('id', activeScene.id)
    }, [activeScene?.id])
  )

  // Auto-save selected hotspot
  useAutoSave(
    selectedHotspot,
    useCallback(async (hotspot: Hotspot | null) => {
      if (!hotspot) return
      await supabase.from('hotspots').update({
        title: hotspot.title,
        body: hotspot.body,
        media_url: hotspot.media_url,
        media_type: hotspot.media_type,
      }).eq('id', hotspot.id)
    }, [])
  )

  const handlePanoramaClick = useCallback(async (pitch: number, yaw: number) => {
    if (!state.activeSceneId) return
    const { data } = await supabase
      .from('hotspots')
      .insert({ scene_id: state.activeSceneId, pitch, yaw, title: 'New Hotspot' })
      .select()
      .single()

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
      .insert({
        project_id: projectId,
        title: `Scene ${newIndex + 1}`,
        image_url: url,
        order_index: newIndex,
      })
      .select()
      .single()

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
    if (url) {
      dispatch({ type: 'UPDATE_HOTSPOT', hotspotId, updates: { media_url: url } })
    }
  }, [user, upload])

  if (state.loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      <Toolbar
        sceneTitle={activeScene?.title ?? ''}
        onSceneTitleChange={title => {
          if (activeScene) dispatch({ type: 'UPDATE_SCENE', sceneId: activeScene.id, updates: { title } })
        }}
        placementMode={state.placementMode}
        onTogglePlacement={() => dispatch({ type: 'TOGGLE_PLACEMENT' })}
        onUploadImage={handleUploadImage}
        onPreview={() => window.open(`/play/${projectId}`, '_blank')}
        onPreviewIgloo={() => window.open(`/play/${projectId}?mode=igloo`, '_blank')}
        onBack={() => navigate('/')}
        saving={sceneTitleSave.saving}
        lastSaved={sceneTitleSave.lastSaved}
        uploading={uploading}
      />

      <div className="flex flex-1 min-h-0">
        {/* 360 Viewer - 70% */}
        <div className="flex-[7] relative">
          {!activeScene?.image_url ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                  </svg>
                </div>
                <p className="text-xs text-zinc-500">Upload a 360° image to get started</p>
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

        {/* Hotspot Panel - 30% */}
        <div className="flex-[3] border-l border-zinc-800">
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

      <SceneStrip
        scenes={state.scenes}
        activeSceneId={state.activeSceneId}
        onSelectScene={id => dispatch({ type: 'SET_ACTIVE_SCENE', sceneId: id })}
        onAddScene={handleAddScene}
        onDeleteScene={handleDeleteScene}
        onReplaceImage={handleReplaceImage}
      />
    </div>
  )
}
