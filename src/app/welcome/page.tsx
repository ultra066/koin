import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { completeOnboarding } from './actions'
import { Button } from '@/components/ui/button'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

const currencies = [
  { id: 'usd', symbol: '$', name: 'US Dollar' },
  { id: 'eur', symbol: '€', name: 'Euro' },
  { id: 'gbp', symbol: '£', name: 'British Pound' },
  { id: 'php', symbol: '₱', name: 'Philippine Peso' },
  { id: 'jpy', symbol: '¥', name: 'Japanese Yen' },
  { id: 'aud', symbol: 'A$', name: 'Australian Dollar' }
]

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()

  const firstName = profile?.first_name || 'there'

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${poppins.className}`}>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome, {firstName}!</h1>
          <p className="text-gray-500 mt-2">Let's set up your master ledger. What currency do you use?</p>
        </div>

        <form action={completeOnboarding} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {currencies.map((c) => (
              <label key={c.id} className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="currency" 
                  value={c.symbol} 
                  className="peer sr-only" 
                  defaultChecked={c.symbol === '$'} 
                />
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-100 bg-white hover:bg-gray-50 peer-checked:border-[#1c1c1c] peer-checked:bg-gray-50 transition-all">
                  <span className="text-2xl font-bold text-gray-900 mb-1">{c.symbol}</span>
                  <span className="text-xs text-gray-500 font-medium">{c.name}</span>
                </div>
              </label>
            ))}
          </div>

          <Button type="submit" className="w-full h-12 text-base bg-[#1c1c1c] hover:bg-black text-white">
            Continue to Dashboard
          </Button>
        </form>
      </div>
    </div>
  )
}