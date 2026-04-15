export type MediaType = 'image' | 'youtube' | 'video' | 'chart' | 'gallery' | 'map' | 'audio'

export interface MapData {
  lat: number
  lng: number
  label?: string
}

export type ChartType = 'bar' | 'pie'

export interface ChartData {
  type: ChartType
  labels: string[]
  values: number[]
}

export interface Project {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  project_id: string
  title: string
  image_url: string | null
  order_index: number
  created_at: string
}

export interface Hotspot {
  id: string
  scene_id: string
  pitch: number
  yaw: number
  title: string
  body: string | null
  media_url: string | null
  media_type: MediaType | null
  created_at: string
}

export interface ProjectWithScenes extends Project {
  scenes: SceneWithHotspots[]
}

export interface SceneWithHotspots extends Scene {
  hotspots: Hotspot[]
}
