import { useState } from 'react'
import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onDelete: () => void
}

export default function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const [copied, setCopied] = useState(false)

  const updatedAt = new Date(project.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
      className="bg-slate-800 border border-slate-700 rounded-lg p-5 cursor-pointer hover:border-slate-500 transition-colors group relative"
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyLink}
          className="w-8 h-8 flex items-center justify-center rounded text-slate-500 hover:text-blue-400 hover:bg-slate-700"
          title="Copy player link"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )}
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="w-8 h-8 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700"
          title="Delete project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      <h3 className="text-white font-medium mb-2 pr-16">{project.title}</h3>
      <p className="text-sm text-slate-400">Updated {updatedAt}</p>
    </div>
  )
}
