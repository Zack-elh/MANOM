'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('manom_auth')
    if (auth) {
      try {
        const parsed = JSON.parse(auth)
        if (parsed.user) {
          if (parsed.user.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          localStorage.removeItem('manom_auth')
        }
      } catch {
        localStorage.removeItem('manom_auth')
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      localStorage.setItem('manom_auth', JSON.stringify({ user: data.user, token: data.token }))

      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/signup.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      const loginRes = await fetch(`${API}/api/auth/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()

      if (loginRes.ok) {
        localStorage.setItem('manom_auth', JSON.stringify({ user: loginData.user }))
        router.push('/booking')
      } else {
        router.push('/auth')
      }
    } catch {
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/forgot-password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.token) {
        setResetToken(data.token)
        setSuccessMsg('Reset token generated. Copy it below.')
        setForgotStep(2)
      } else {
        setSuccessMsg(data.message || 'Check your email for reset instructions.')
        setForgotStep(2)
      }
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/reset-password.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Reset failed')
        setLoading(false)
        return
      }

      setSuccessMsg('Password reset successfully! Redirecting to sign in...')
      setTimeout(() => {
        setMode('login')
        setForgotStep(1)
        setToken('')
        setPassword('')
        setConfirmPassword('')
        setResetToken('')
        setSuccessMsg('')
      }, 2000)
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setError('')
    setSuccessMsg('')
    setForgotStep(1)
    setResetToken('')
  }

  const goToForgot = () => {
    setMode('forgot')
    setForgotStep(1)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccessMsg('')
    setResetToken('')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-black transition-colors text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>

        <div className="relative">
          {/* Sign In Form */}
          <div
            className="w-full transition-all duration-500 ease-in-out"
            style={{
              transform: mode === 'login' ? 'translateX(0) scale(1)' : 'translateX(-50px) scale(0.95)',
              opacity: mode === 'login' ? 1 : 0,
              pointerEvents: mode === 'login' ? 'auto' : 'none',
            }}
          >
            <span className="section-label">Welcome Back</span>
            <h1 className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
              Sign In
            </h1>
            <p className="text-text-tertiary text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
              Enter your details to access booking
            </p>

            {error && mode === 'login' && (
              <p className="text-red-600 text-xs mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{error}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
              </div>
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-3 pr-10 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-black transition-colors">
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right pt-2">
                <button type="button" onClick={goToForgot} className="text-xs text-verdigris hover:text-black transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-3 disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In & Book'}
              </button>
            </form>
          </div>

          {/* Sign Up Form */}
          <div
            className="w-full absolute top-0 left-0 transition-all duration-500 ease-in-out"
            style={{
              transform: mode === 'signup' ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.95)',
              opacity: mode === 'signup' ? 1 : 0,
              pointerEvents: mode === 'signup' ? 'auto' : 'none',
            }}
          >
            <span className="section-label">Create Account</span>
            <h1 className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
              Sign Up
            </h1>
            <p className="text-text-tertiary text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
              Create an account to book your experience
            </p>

            {error && mode === 'signup' && (
              <p className="text-red-600 text-xs mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{error}</p>
            )}

            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full py-2 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
              </div>
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-2 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
              </div>
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-2 pr-10 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-black transition-colors">
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-ui)' }}>Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full py-2 pr-10 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-black transition-colors">
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account & Book'}
              </button>
            </form>

            <p className="text-center text-sm text-text-tertiary mt-1" style={{ fontFamily: 'var(--font-ui)' }}>
              Already have an account?{' '}
              <button onClick={toggleMode} className="text-black font-medium hover:text-verdigris transition-colors">Sign In</button>
            </p>
          </div>

          {/* Forgot Password Form */}
          <div
            className="w-full absolute top-0 left-0 transition-all duration-500 ease-in-out"
            style={{
              transform: mode === 'forgot' ? 'translateX(0) scale(1)' : 'translateX(50px) scale(0.95)',
              opacity: mode === 'forgot' ? 1 : 0,
              pointerEvents: mode === 'forgot' ? 'auto' : 'none',
            }}
          >
            <span className="section-label">Reset Password</span>
            <h1 className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
              {forgotStep === 1 ? 'Forgot Password' : 'Set New Password'}
            </h1>
            <p className="text-text-tertiary text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
              {forgotStep === 1
                ? 'Enter your email to receive a reset token'
                : 'Enter the token and your new password'}
            </p>

            {error && (
              <p className="text-red-600 text-xs mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{error}</p>
            )}
            {successMsg && (
              <p className="text-verdigris text-xs mb-4" style={{ fontFamily: 'var(--font-ui)' }}>{successMsg}</p>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-3 disabled:opacity-50">
                  {loading ? 'Generating...' : 'Generate Reset Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                {resetToken && (
                  <div className="p-3 bg-surface-alt border border-black/[0.08]">
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-ui)' }}>Your Reset Token</p>
                    <p className="text-xs font-mono text-black break-all" style={{ fontFamily: 'var(--font-ui)' }}>{resetToken}</p>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(resetToken); setSuccessMsg('Token copied!'); }} className="text-[10px] text-verdigris mt-1" style={{ fontFamily: 'var(--font-ui)' }}>Copy token</button>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>Reset Token</label>
                  <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Paste your token here" className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors placeholder:text-text-tertiary/50" style={{ fontFamily: 'var(--font-ui)' }} />
                </div>
                <div>
                  <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>New Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-3 pr-10 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-black transition-colors">
                      {showNewPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>Confirm New Password</label>
                  <div className="relative">
                    <input type={showConfirmNewPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full py-3 pr-10 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors" style={{ fontFamily: 'var(--font-ui)' }} />
                    <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-black transition-colors">
                      {showConfirmNewPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full mt-3 disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-text-tertiary mt-4" style={{ fontFamily: 'var(--font-ui)' }}>
              <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setForgotStep(1); setResetToken(''); setToken(''); }} className="text-black font-medium hover:text-verdigris transition-colors">
                Back to Sign In
              </button>
            </p>
          </div>
        </div>

        {mode !== 'forgot' && (
          <p className="text-center text-sm text-text-tertiary mt-3" style={{ fontFamily: 'var(--font-ui)' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={toggleMode} className="text-black font-medium hover:text-verdigris transition-colors">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
