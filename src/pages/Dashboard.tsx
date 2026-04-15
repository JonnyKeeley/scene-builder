import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types/database'
import ProjectCard from '@/components/ProjectCard'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ProjectWithThumb extends Project {
  thumbnail: string | null
}

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectWithThumb[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithThumb | null>(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*, scenes(image_url)')
        .order('updated_at', { ascending: false })

      if (data) {
        const withThumbs: ProjectWithThumb[] = data.map((p: Project & { scenes: { image_url: string | null }[] }) => ({
          ...p,
          thumbnail: p.scenes?.find((s: { image_url: string | null }) => s.image_url)?.image_url ?? null,
        }))
        setProjects(withThumbs)
      }
      setLoading(false)
    }
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
      await supabase.from('scenes').insert({ project_id: data.id, title: 'Scene 1', order_index: 0 })
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
      <header className="border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-zinc-50 tracking-[0.15em] uppercase">IGLOO</span>
        <div className="flex items-center gap-4">
          <span className="font-mono-caption text-zinc-600">{user?.email}</span>
          <button onClick={signOut} className="text-[12px] text-zinc-600 hover:text-zinc-300 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl panel-glass flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                </svg>
              </div>
              <p className="text-[14px] text-zinc-500 mb-5">Create your first 360° experience</p>
              <button onClick={createProject}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]">
                New project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                thumbnail={project.thumbnail}
                onClick={() => navigate(`/project/${project.id}`)}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
            {/* New project card */}
            <button
              onClick={createProject}
              className="aspect-[4/3] rounded-xl border border-dashed border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-teal-500/30 group-hover:bg-teal-500/5 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-teal-400 transition-colors">
                  <path d="M5 12h14"/><path d="M12 5v14"/>
                </svg>
              </div>
              <span className="text-[13px] text-zinc-600 group-hover:text-zinc-300 transition-colors">New project</span>
            </button>
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
