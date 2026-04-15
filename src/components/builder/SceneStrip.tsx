import { useRef } from 'react'
import type { Scene } from '@/types/database'

interface SceneStripProps {
  scenes: Scene[]
  activeSceneId: string | null
  onSelectScene: (sceneId: string) => void
  onAddScene: (file: File) => void
  onDeleteScene: (sceneId: string) => void
  onReplaceImage: (sceneId: string, file: File) => void
}

export default function SceneStrip({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onReplaceImage,
}: SceneStripProps) {
  const addFileRef = useRef<HTMLInputElement>(null)
  const replaceFileRef = useRef<HTMLInputElement>(null)
  const replaceTargetRef = useRef<string | null>(null)

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
          {/* Action buttons — top right */}
          <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover/scene:opacity-100 transition-all">
            {/* Replace image */}
            <button
              onClick={e => {
                e.stopPropagation()
                replaceTargetRef.current = scene.id
                replaceFileRef.current?.click()
              }}
              className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-teal-400 hover:border-teal-400 transition-all"
              title="Replace 360 image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              </svg>
            </button>
            {/* Delete scene */}
            {scenes.length > 1 && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onDeleteScene(scene.id)
                }}
                className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-400 transition-all"
                title="Delete scene"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            )}
          </div>

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
        onClick={() => addFileRef.current?.click()}
        className="shrink-0 h-14 w-14 rounded-md border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-all"
        title="Add scene"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
      </button>

      {/* Hidden file inputs */}
      <input
        ref={addFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onAddScene(file)
          e.target.value = ''
        }}
        className="hidden"
      />
      <input
        ref={replaceFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          const file = e.target.files?.[0]
          const sceneId = replaceTargetRef.current
          if (file && sceneId) onReplaceImage(sceneId, file)
          e.target.value = ''
          replaceTargetRef.current = null
        }}
        className="hidden"
      />
    </div>
  )
}
