import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Pass the request to your Supabase logic
  return await updateSession(request)
}

export const config = {
  // The matcher tells Next.js WHICH routes should run this middleware.
  // This regex ignores static files, images, and Next.js internals to keep performance lightning fast.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}