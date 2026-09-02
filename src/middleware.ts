import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  let hostname = request.headers.get('host') || 'localhost:3000'
  hostname = hostname.replace(/:\d+$/, '')

  const sessionCookie = request.cookies.get('auth_session')?.value
  const isAdminDomain = hostname.startsWith('admin.') || hostname === 'motor.neurolabs.tech' || hostname === 'admin.localhost' || hostname === 'admin.neurolabs.tech'

  // Proteger rutas del dashboard administrativo (/app)
  if (url.pathname.startsWith('/app')) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'Debes iniciar sesión para acceder al panel de control.')
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Si ya tiene sesión activa e intenta ir al /login, enviarlo al dashboard
  if (url.pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Manejo de dominios administrativos
  if (isAdminDomain) {
    if (!sessionCookie && !url.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!url.pathname.startsWith('/app') && !url.pathname.startsWith('/login')) {
      return NextResponse.rewrite(new URL(`/app${url.pathname}`, request.url))
    }
    return NextResponse.next()
  }

  // Determinar el tenant (por defecto yjdtrinova)
  let tenant = 'yjdtrinova'
  if (hostname.includes('.') && !hostname.includes('vercel.app') && !hostname.includes('localhost')) {
    const sub = hostname.split('.')[0]
    if (sub && sub !== 'www') {
      tenant = sub
    }
  }

  // Si la ruta ya incluye el slug del tenant o /api, dejar pasar
  if (url.pathname.startsWith(`/${tenant}`) || url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Rutas públicas (Marketplace, Registro de Proveedores, Admin de Trinova)
  return NextResponse.rewrite(new URL(`/${tenant}${url.pathname}`, request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - login (login route itself)
     * - static image and asset files (.jpg, .png, .svg, .ico, etc.)
     */
    '/((?!api|_next/static|_next/image|login|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf|woff2|woff|ttf|css|js)$).*)',
  ],
}
