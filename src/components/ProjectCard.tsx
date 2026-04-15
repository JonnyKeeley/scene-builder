import { useState } from 'react'
import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
  thumbnail: string | null
  onClick: () => void
  onDelete: () => void
}

export default function ProjectCard({ project, thumbnail, onClick, onDelete }: ProjectCardProps) {
  const [copied, setCopied] = useState(false)

  const updatedAt = new Date(project.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const playerUrl = `${window.location.origin}/play/${project.id}`

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(playerUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClick}
      className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group relative bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="absolute inset-0">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
        )}
        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
      </div>

      {/* Content overlay — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-[14px] font-medium text-zinc-50 mb-0.5">{project.title}</h3>
        <p className="font-mono-caption text-zinc-500">{updatedAt}</p>
      </div>

      {/* Hover action bar — bottom of thumbnail area */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyLink}
          className="w-7 h-7 rounded-lg panel-glass flex items-center justify-center text-zinc-400 hover:text-teal-400 transition-all"
          title="Copy player link"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="w-7 h-7 rounded-lg panel-glass flex items-center justify-center text-zinc-400 hover:text-red-400 transition-all"
          title="Delete project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
