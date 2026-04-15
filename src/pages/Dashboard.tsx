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
      // Create a default first scene
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
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Igloo Scene Builder</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <button
            onClick={createProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
          >
            New project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-4">No projects yet</p>
            <button
              onClick={createProject}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
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
