import Link from 'next/link'
import { useRouter } from 'next/router'
import { AuthUser } from '@/hooks/useAuth'

function getNavItems(role: string) {
  const isSPV = role.includes('spv')
  const isHK  = role.includes('housekeeping')
  return [
    { href: '/mobile/dashboard',   label: 'Home' },
    { href: '/mobile/checklist',   label: isHK ? 'Checklist' : 'PM' },
    { href: '/mobile/work-orders', label: 'WO',       hidden: isHK && !isSPV },
    { href: '/mobile/approvals',   label: 'Approval', hidden: !isSPV },
    { href: '/mobile/materials',   label: 'Material' },
    { href: '/mobile/monitoring',  label: 'Monitor' },
    { href: '/mobile/profile',     label: 'Profil' },
  ].filter(n => !n.hidden)
}

export function MobileLayout({ children, user, onLogout, title }: {
  children: React.ReactNode; user: AuthUser; onLogout: () => void; title?: string
}) {
  const router = useRouter()
  const navItems = getNavItems(user.role)

  return (
    <div style={{ minHeight:'100vh', background:'#f7f7f6', paddingBottom:70, maxWidth:480, margin:'0 auto', position:'relative' }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'#fff', borderBottom:'1px solid #ebebeb', padding:'0 16px', height:50, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:26, height:26, background:'#111', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#fff', fontSize:9, fontWeight:600 }}>SM</span>
          </div>
          <span style={{ fontSize:13, fontWeight:500, color:'#111' }}>{title || 'SOMA BMS'}</span>
        </div>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#555' }}>
          {user.full_name?.slice(0,2).toUpperCase() || 'U'}
        </div>
      </header>

      <div style={{ padding:16 }}>{children}</div>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #ebebeb', display:'flex', zIndex:40 }}>
        {navItems.map(item => {
          const active = router.pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ flex:1, textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8px 4px', gap:2, color: active ? '#111' : '#bbb', borderTop: active ? '2px solid #111' : '2px solid transparent', transition:'color .15s' }}>
              <span style={{ fontSize:9, fontWeight: active ? 500 : 400 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}