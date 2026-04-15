import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-[340px] animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-[13px] font-semibold text-zinc-50 tracking-[0.15em] uppercase">
            IGLOO
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">Scene Builder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-[13px] animate-slide-up">
              {error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full px-3 py-3 bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Password"
            className="w-full px-3 py-3 bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-zinc-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal-400 hover:text-teal-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
