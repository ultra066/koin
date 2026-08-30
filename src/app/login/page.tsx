'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from './actions'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clientError, setClientError] = useState('')
  
  const searchParams = useSearchParams()
  const serverError = searchParams.get('error')
  const displayError = clientError || serverError

  const isMatch = password === confirmPassword && confirmPassword.length > 0
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError('')
    if (!isLogin && password !== confirmPassword) {
      e.preventDefault()
      setClientError('Passwords do not match.')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setClientError('')
    setPassword('')
    setConfirmPassword('')
  }

  const EyeIcon = ({ show }: { show: boolean }) => (
    show ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    )
  )

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${poppins.className}`}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Koin</h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back.' : 'Start mastering your money.'}</p>
        </div>

        {displayError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
            {displayError}
          </div>
        )}

        <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" placeholder="Alex" required={!isLogin} className="h-11" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-11" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-11 pr-10 transition-colors ${!isLogin && isMatch ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''} ${!isLogin && isMismatch ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                minLength={6} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirm_password" 
                  name="confirm_password" 
                  type={showConfirm ? "text" : "password"} 
                  required={!isLogin} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 pr-10 transition-colors ${isMatch ? 'border-emerald-500 focus-visible:ring-emerald-500' : ''} ${isMismatch ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
                  minLength={6} 
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-xs mt-1 font-medium ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={!isLogin && isMismatch} className="w-full h-11 bg-[#1c1c1c] hover:bg-black text-white mt-2 disabled:opacity-50">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={toggleMode} className="font-semibold text-gray-900 hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}