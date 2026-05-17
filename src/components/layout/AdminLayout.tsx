import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AuthUser } from '@/hooks/useAuth'
import { buildingsApi } from '@/lib/api'

const NAV = [
  {
    section: 'General',
    items: [
      { href: '/admin/dashboard',   label: 'Dashboard' },
      { href: '/admin/assets',      label: 'Aset' },
      { href: '/admin/templates',   label: 'Template' },
      { href: '/admin/schedules',   label: 'Jadwal' },
    ],
  },
  {
    section: 'Operasional',
    items: [
      { href: '/admin/work-orders', label: 'Work Order' },
      { href: '/admin/materials',   label: 'Material' },
      { href: '/admin/alarms',      label: 'Alarm' },
      { href: '/admin/billing',     label: 'Billing' },
    ],
  },
  {
    section: 'Manajemen',
    items: [
      { href: '/tro/dashboard',        label: 'Tamu' },
      { href: '/admin/users',          label: 'Users' },
      { href: '/admin/subscription',   label: 'Langganan' },
    ],
  },
]

export function AdminLayout({
  children,
  user,
  onLogout,
  title,
}: {
  children: React.ReactNode
  user: AuthUser
  onLogout: () => void
  title?: string
}) {
  const router = useRouter()
  const [building, setBuilding] = useState<any>(null)

  useEffect(() => {
    if (!user?.building_id) return
    buildingsApi.list().then((r) => {
      const found = (r.data as any[]).find((b: any) => b.id === user.building_id)
      setBuilding(found || null)
    }).catch(() => {})
  }, [user])

  const initials = (user.full_name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f7f6', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #ebebeb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        zIndex: 20,
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px', height: '30px',
              background: '#111', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>SM</span>
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.2 }}>SOMA BMS</p>
              <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.2, marginTop: '2px' }}>
                {building?.name || 'Building Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV.map((group) => (
            <div key={group.section} style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: '10px', fontWeight: 600,
                color: '#bbb', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0 8px', marginBottom: '4px',
              }}>
                {group.section}
              </p>
              {group.items.map((item) => {
                const active =
                  router.pathname.startsWith(item.href) ||
                  (item.href === '/tro/dashboard' && router.pathname.startsWith('/tro'))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: active ? 500 : 400,
                      color: active ? '#111' : '#666',
                      background: active ? '#f0f0f0' : 'transparent',
                      textDecoration: 'none',
                      marginBottom: '2px',
                      transition: 'all 0.1s',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — user info + logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0' }}>
          <Link
            href="/mobile/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 10px', borderRadius: '8px',
              fontSize: '13px', color: '#888',
              textDecoration: 'none', marginBottom: '4px',
            }}
          >
            Mobile App
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>{initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.full_name}
              </p>
              <p style={{ fontSize: '11px', color: '#999', textTransform: 'capitalize' }}>
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
            <button
              onClick={onLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '13px', padding: '4px' }}
              title="Keluar"
            >
              ⇥
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #ebebeb',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <h1 style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>
            {title || 'SOMA BMS'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#bbb' }}>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}