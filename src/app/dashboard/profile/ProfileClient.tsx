'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfileData, updatePasswordData } from './actions'

const currencies = [
  { id: 'usd', symbol: '$', name: 'US Dollar' },
  { id: 'eur', symbol: '€', name: 'Euro' },
  { id: 'gbp', symbol: '£', name: 'British Pound' },
  { id: 'php', symbol: '₱', name: 'Philippine Peso' },
  { id: 'jpy', symbol: '¥', name: 'Japanese Yen' },
  { id: 'aud', symbol: 'A$', name: 'Australian Dollar' }
]

const EyeIcon = ({ show }: { show: boolean }) => (
  show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  )
)

export default function ProfileClient({ initialName, initialCurrency, email }: { initialName: string, initialCurrency: string, email: string }) {
  const [name, setName] = useState(initialName)
  const [currency, setCurrency] = useState(initialCurrency)
  
  // Modal States
  const [isProfileModalOpen, setProfileModalOpen] = useState(false)
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false)

  // Password States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  
  // Status States
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleProfileSave = async () => {
    setIsLoading(true)
    setError('')
    try {
      await updateProfileData(name, currency)
      setProfileModalOpen(false)
      setSuccess('Profile updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  const handlePasswordSave = async () => {
    if (newPassword !== confirmPassword) return setError('New passwords do not match.')
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.')
    
    setIsLoading(true)
    setError('')
    try {
      await updatePasswordData(oldPassword, newPassword)
      setPasswordModalOpen(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Password updated successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md border border-emerald-200">{success}</div>}
      
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">First Name</p>
              <p className="text-gray-900 font-semibold mt-1">{name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Email Address</p>
              <p className="text-gray-900 font-semibold mt-1">{email}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Base Currency</p>
              <p className="text-gray-900 font-semibold mt-1 text-xl">{currency}</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Button onClick={() => setProfileModalOpen(true)} className="bg-[#1c1c1c] hover:bg-black text-white">
              Edit Profile
            </Button>
            <Button onClick={() => setPasswordModalOpen(true)} variant="outline">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCurrency(c.symbol)}
                      className={`p-2 border rounded-md text-center transition-all ${currency === c.symbol ? 'border-[#1c1c1c] bg-gray-50 ring-1 ring-[#1c1c1c]' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="font-bold">{c.symbol}</div>
                      <div className="text-[10px] text-gray-500">{c.id.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setProfileModalOpen(false)}>Cancel</Button>
              <Button onClick={handleProfileSave} disabled={isLoading} className="bg-[#1c1c1c] text-white">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input type={showOld ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><EyeIcon show={showOld} /></button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><EyeIcon show={showNew} /></button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type={showNew ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className={`${isMatch ? 'border-emerald-500' : ''} ${isMismatch ? 'border-red-500' : ''}`}
                />
                {confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1 font-medium ${isMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => { setPasswordModalOpen(false); setError(''); }}>Cancel</Button>
              <Button onClick={handlePasswordSave} disabled={isLoading || isMismatch || !oldPassword} className="bg-[#1c1c1c] text-white">Update Password</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}