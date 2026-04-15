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

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-zinc-50 tracking-tight mb-2">Check your email</h1>
            <p className="text-sm text-zinc-400 mb-6">
              We've sent a confirmation link to <span className="text-zinc-50">{email}</span>
            </p>
            <Link to="/login" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

          <h1 className="text-xl font-semibold text-zinc-50 tracking-tight mb-6 text-center">
            Create an account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-md text-sm animate-slide-up">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-500 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-zinc-500 mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-all active:scale-[0.98]"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
