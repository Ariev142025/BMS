import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie, deleteCookie, setCookie } from 'cookies-next'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string
  building_id?: string
  token: string
}

export function useAuth(allowedRoles?: string[]) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('access_token') as string
    if (!token) { setLoading(false); router.push('/login'); return }

    try {
      const payload = JSON.parse(
        typeof window !== 'undefined'
          ? atob(token.split('.')[1])
          : Buffer.from(token.split('.')[1], 'base64').toString()
      )
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        deleteCookie('access_token')
        router.push('/login')
        setLoading(false)
        return
      }
      const u: AuthUser = {
        id: payload.sub,
        email: getCookie('user_email') as string || '',
        full_name: getCookie('user_name') as string || 'User',
        role: payload.role,
        company_id: payload.company_id,
        building_id: payload.building_id,
        token,
      }
      if (allowedRoles && !allowedRoles.includes(u.role)) {
        router.push('/unauthorized')
        setLoading(false)
        return
      }
      setUser(u)
    } catch { deleteCookie('access_token'); router.push('/login') }
    setLoading(false)
  }, [])

  const logout = () => {
    deleteCookie('access_token'); deleteCookie('user_email'); deleteCookie('user_name')
    router.push('/login')
  }

  return { user, loading, logout }
}
