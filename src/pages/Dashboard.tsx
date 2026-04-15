import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/database'
import ProjectCard from '@/components/ProjectCard'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (data) setProjects(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const createProject = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, title: 'Untitled Project' })
      .select()
      .single()

    if (data && !error) {
      await supabase
        .from('scenes')
        .insert({ project_id: data.id, title: 'Scene 1', order_index: 0 })

      navigate(`/project/${data.id}`)
    }
  }

  const deleteProject = async () => {
    if (!deleteTarget) return
    await supabase.from('projects').delete().eq('id', deleteTarget.id)
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-zinc-50 tracking-tight">Igloo Scene Builder</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-zinc-50 tracking-tight">Projects</h2>
          <button
            onClick={createProject}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-md font-medium transition-all active:scale-[0.98]"
          >
            New project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-4">No projects yet</p>
            <button
              onClick={createProject}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-md font-medium transition-all active:scale-[0.98]"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/project/${project.id}`)}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={deleteProject}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
