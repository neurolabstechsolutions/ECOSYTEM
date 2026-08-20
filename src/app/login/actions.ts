'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = (formData.get('password') as string || '').trim()
  
  // Valid credentials for agency and executives
  const validUsers: Record<string, string> = {
    'neurolabstechsolutions@gmail.com': 'admin2026',
    'superadmin@neurolabs.ai': 'admin123',
    'admin@jytrinova.com': 'trinova2026',
    'admin@automotriz.com': 'password123'
  }

  if (validUsers[email] && validUsers[email] === password) {
    const cookieStore = await cookies()
    cookieStore.set('auth_session', JSON.stringify({ email, timestamp: Date.now() }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    redirect('/app')
  } else {
    redirect('/login?error=Credenciales%20inv%C3%A1lidas.%20Verifica%20tu%20correo%20y%20contrase%C3%B1a.')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  redirect('/login')
}
