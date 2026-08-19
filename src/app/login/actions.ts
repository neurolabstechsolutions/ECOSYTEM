'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  
  // Mock login: aceptar los correos de prueba
  if (email === 'superadmin@neurolabs.ai' || email === 'admin@automotriz.com') {
    const cookieStore = await cookies()
    cookieStore.set('mock_session', email)
    redirect('/dashboard')
  } else {
    redirect('/login?error=Credenciales inválidas (usa superadmin@neurolabs.ai o admin@automotriz.com)')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('mock_session')
  redirect('/login')
}
