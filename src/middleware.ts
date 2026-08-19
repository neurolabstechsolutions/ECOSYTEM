import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Extraer el hostname (ej: admin.neurolabs.tech, autos.jjtrinova.com, localhost:3000)
  let hostname = request.headers.get('host') || 'localhost:3000'

  // Remover puertos para Vercel en producción
  hostname = hostname.replace(/:\d+$/, '')

  // Definir dominios administrativos (NeuroLabs God Mode / Panel Interno)
  const isAdminDomain = hostname.startsWith('admin.') || hostname === 'motor.neurolabs.tech' || hostname === 'admin.localhost' || hostname === 'admin.neurolabs.tech'

  // Si estamos en un dominio administrativo
  if (isAdminDomain) {
    // Si la ruta no empieza con /app, reescribirla a /app internamente
    if (!url.pathname.startsWith('/app')) {
      return NextResponse.rewrite(new URL(`/app${url.pathname}`, request.url))
    }
  } 
  // Si NO es un dominio administrativo, asumimos que es el Marketplace B2C (Ej: jjtrinova.neurolabs.tech)
  else {
    // Evitar que accedan al dashboard administrativo desde el dominio del marketplace
    if (url.pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Extraer el nombre del inquilino (tenant) del subdominio o usar localhost
    let tenant = hostname.split('.')[0]
    if (hostname.includes('localhost')) {
      tenant = hostname.split('.')[0] !== 'localhost' ? hostname.split('.')[0] : 'jjtrinova' // fallback para dev
    }

    // Reescribir tráfico de la raíz al Route Group del Marketplace
    return NextResponse.rewrite(new URL(`/${tenant}${url.pathname}`, request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with or ending in:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static image and asset files (.jpg, .png, .svg, .ico, etc.)
     */
    '/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf|woff2|woff|ttf|css|js)$).*)',
  ],
}
