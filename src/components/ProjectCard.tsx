import type { Project } from '@/types/database'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onDelete: () => void
}

export default function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const updatedAt = new Date(project.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-lg p-5 cursor-pointer hover:border-slate-500 transition-colors group relative"
    >
      <button
        onClick={e => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete project"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>

      <h3 className="text-white font-medium mb-2 pr-8">{project.title}</h3>
      <p className="text-sm text-slate-400">Updated {updatedAt}</p>
    </div>
  )
}
