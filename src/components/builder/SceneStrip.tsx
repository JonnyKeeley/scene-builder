import { useRef } from 'react'
import type { Scene } from '@/types/database'

interface SceneStripProps {
  scenes: Scene[]
  activeSceneId: string | null
  onSelectScene: (sceneId: string) => void
  onAddScene: (file: File) => void
  onDeleteScene: (sceneId: string) => void
}

export default function SceneStrip({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
}: SceneStripProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 gap-3 overflow-x-auto shrink-0">
      {scenes.map(scene => (
        <div
          key={scene.id}
          onClick={() => onSelectScene(scene.id)}
          className={`shrink-0 h-14 px-4 rounded-md flex items-center gap-2 text-sm cursor-pointer relative group/scene transition-all ${
            scene.id === activeSceneId
              ? 'bg-teal-500/10 border border-teal-500/30 text-zinc-50'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          }`}
        >
          {scenes.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                onDeleteScene(scene.id)
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-400 opacity-0 group-hover/scene:opacity-100 transition-all"
              title="Delete scene"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
          {scene.image_url ? (
            <img
              src={scene.image_url}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
          )}
          <span className="max-w-[100px] truncate text-xs font-medium">{scene.title}</span>
        </div>
      ))}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 h-14 w-14 rounded-md border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-all"
        title="Add scene"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onAddScene(file)
          e.target.value = ''
        }}
        className="hidden"
      />
    </div>
  )
}
