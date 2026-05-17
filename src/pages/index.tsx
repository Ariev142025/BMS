import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getCookie } from 'cookies-next'
import LandingPage from './landing'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('access_token')
    if (token) {
      try {
        const p = JSON.parse(atob((token as string).split('.')[1]))
        if (['teknisi', 'housekeeping', 'spv_teknisi', 'spv_housekeeping'].includes(p.role)) {
          router.push('/mobile/dashboard')
        } else if (p.role === 'tro') {
          router.push('/tro/dashboard')
        } else if (p.role === 'super_admin') {
          router.push('/superadmin')
        } else {
          router.push('/admin/dashboard')
        }
      } catch {}
    }
    // Jika tidak ada token → tampilkan landing page (tidak redirect)
  }, [])

  return <LandingPage />
}
