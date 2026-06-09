'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      localStorage.setItem('manom_auth', 'true')
      localStorage.setItem('manom_user', email)
      router.push('/booking')
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-black transition-colors text-sm mb-12" style={{ fontFamily: 'var(--font-ui)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to home
        </Link>

        <div className="relative overflow-hidden" style={{ minHeight: mode === 'signup' ? '520px' : '420px' }}>
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
            <h1
              className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Sign In
            </h1>
            <p className="text-text-tertiary text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
              Enter your details to access booking
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors"
                  style={{ fontFamily: 'var(--font-ui)' }}
                />
              </div>

              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors"
                  style={{ fontFamily: 'var(--font-ui)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full mt-6">
                Sign In & Book
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
            <h1
              className="text-3xl md:text-5xl text-black mb-4 leading-[1.1]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Sign Up
            </h1>
            <p className="text-text-tertiary text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
              Create an account to book your experience
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-tertiary uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-ui)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 border-b border-black/[0.08] text-sm text-black bg-transparent outline-none focus:border-verdigris transition-colors"
                  style={{ fontFamily: 'var(--font-ui)' }}
                />
              </div>

              <div className="text-right">
                <button type="button" className="text-xs text-verdigris hover:text-black transition-colors" style={{ fontFamily: 'var(--font-ui)' }}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Create Account & Book
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-4" style={{ fontFamily: 'var(--font-ui)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="text-black font-medium hover:text-verdigris transition-colors"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
