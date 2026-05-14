import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Unauthenticated users trying to access protected routes
  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/cadastro') || 
                      pathname.startsWith('/esqueci-senha') || 
                      pathname.startsWith('/nova-senha')

  const isApiWebhook = pathname.startsWith('/api/payments/webhook')

  if (!user && !isAuthRoute && !isApiWebhook && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Authenticated users trying to access auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3 & 4. Checks for authenticated users on protected routes
  if (user && !isAuthRoute && !isApiWebhook && !pathname.startsWith('/api')) {
    
    // We need to fetch user profile, company, and fiscal profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profile?.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('subscription_status')
        .eq('id', profile.company_id)
        .single()

      if (company) {
        // 4. Check suspension status
        if (company.subscription_status === 'suspended' && !pathname.startsWith('/planos')) {
          return NextResponse.redirect(new URL('/planos', request.url))
        }

        // 3. Check onboarding status
        if (company.subscription_status !== 'suspended') {
          const { data: fiscalProfile } = await supabase
            .from('fiscal_profiles')
            .select('onboarding_completed')
            .eq('company_id', profile.company_id)
            .single()

          const isOnboardingRoute = pathname.startsWith('/dashboard/onboarding')
          
          if (fiscalProfile && fiscalProfile.onboarding_completed === false && !isOnboardingRoute) {
            return NextResponse.redirect(new URL('/dashboard/onboarding', request.url))
          }
        }
      }
    }
  }

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
