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
    <div className="panel-glass flex items-center px-3 py-3 gap-3 max-w-[80vw] overflow-x-auto">
      {scenes.map(scene => (
        <div key={scene.id} className="relative group/thumb shrink-0">
          <button
            onClick={() => onSelectScene(scene.id)}
            className={`w-20 h-20 rounded-xl overflow-hidden transition-all ${
              scene.id === activeSceneId
                ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-zinc-900'
                : 'ring-1 ring-zinc-700 hover:ring-zinc-500 hover:scale-105'
            }`}
            title={scene.title}
          >
            {scene.image_url ? (
              <img src={scene.image_url} alt={scene.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
                </svg>
              </div>
            )}
          </button>

          {/* Hover actions */}
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-10">
            <button
              onClick={() => { replaceTargetRef.current = scene.id; replaceFileRef.current?.click() }}
              className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-teal-400 hover:border-teal-400 transition-all"
              title="Replace image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
              </svg>
            </button>
            {scenes.length > 1 && (
              <button
                onClick={() => onDeleteScene(scene.id)}
                className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-400 transition-all"
                title="Delete scene"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add scene */}
      <button
        onClick={() => addFileRef.current?.click()}
        className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-500 transition-all"
        title="Add scene"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
      </button>

      <input ref={addFileRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e => { const f = e.target.files?.[0]; if (f) onAddScene(f); e.target.value = '' }}
        className="hidden" />
      <input ref={replaceFileRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e => {
          const f = e.target.files?.[0]; const id = replaceTargetRef.current
          if (f && id) onReplaceImage(id, f); e.target.value = ''; replaceTargetRef.current = null
        }}
        className="hidden" />
    </div>
  )
}
