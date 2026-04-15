import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="w-full max-w-[340px] text-center animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-[15px] font-semibold text-zinc-50 mb-2">Check your email</h1>
          <p className="text-[13px] text-zinc-500 mb-6">
            Confirmation link sent to <span className="text-zinc-300">{email}</span>
          </p>
          <Link to="/login" className="text-[12px] text-teal-400 hover:text-teal-300 transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-[340px] animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-[13px] font-semibold text-zinc-50 tracking-[0.15em] uppercase">
            IGLOO
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">Create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-[13px] animate-slide-up">
              {error}
            </div>
          )}

          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="Email"
            className="w-full px-3 py-3 bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />

          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            placeholder="Password"
            className="w-full px-3 py-3 bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />

          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6}
            placeholder="Confirm password"
            className="w-full px-3 py-3 bg-zinc-900/80 backdrop-blur border border-zinc-800/60 rounded-lg text-[13px] text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all" />

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium transition-all active:scale-[0.98]">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-zinc-600">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
