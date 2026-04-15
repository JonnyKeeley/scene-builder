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
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 cursor-pointer hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-px transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-50 pr-4">{project.title}</h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={copyLink}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            title="Copy player link"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            )}
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete()
            }}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete project"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-500">{updatedAt}</p>
    </div>
  )
}
