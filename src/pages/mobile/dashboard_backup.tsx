import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { dashboardApi, alarmsApi, buildingsApi, tasksApi } from '@/lib/api'
import Link from 'next/link'

export default function MobileDashboard() {
  const { user, loading, logout } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [alarms, setAlarms] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      dashboardApi.myStats(),
      alarmsApi.list({ building_id: user.building_id, status:'active', limit:3 }),
      tasksApi.myTasks({ limit:5 }),
    ]).then(([s, a, t]) => {
      setStats(s.data)
      setAlarms((Array.isArray(a.data) ? a.data : a.data?.items || []).slice(0,3))
      setTasks((Array.isArray(t.data) ? t.data : t.data?.items || []).slice(0,5))
    }).catch(console.error)
  }, [user])

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f7f7f6', fontSize:13, color:'#aaa' }}>Memuat...</div>
  if (!user) return null

  const isHK = user.role.includes('housekeeping')
  const isSPV = user.role.includes('spv')
  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })

  return (
    <>
      <Head><title>Dashboard — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="SOMA BMS">

        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:16, fontWeight:600, color:'#111', margin:0 }}>Halo, {user.full_name?.split(' ')[0]} 👋</p>
          <p style={{ fontSize:12, color:'#aaa', margin:'3px 0 0' }}>{today}</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'Task Hari Ini', value: stats?.today_tasks ?? '—' },
            { label:'Selesai',       value: stats?.completed_today ?? '—' },
            { label:'Terlambat',     value: stats?.overdue ?? '—', alert: (stats?.overdue||0) > 0 },
            { label:'WO Aktif',      value: stats?.active_wo ?? '—' },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:`1px solid ${k.alert ? '#fca5a5' : '#ebebeb'}`, borderRadius:10, padding:'14px 16px' }}>
              <p style={{ fontSize:22, fontWeight:600, color: k.alert ? '#c62828' : '#111', margin:0, lineHeight:1 }}>{k.value}</p>
              <p style={{ fontSize:11, color:'#aaa', margin:'5px 0 0' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {alarms.length > 0 && (
          <Link href="/mobile/alarms" style={{ textDecoration:'none', display:'block', marginBottom:16 }}>
            <div style={{ background:'#fff', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 14px' }}>
              <p style={{ fontSize:12, fontWeight:500, color:'#c62828', margin:'0 0 8px' }}>{alarms.length} alarm aktif</p>
              {alarms.map(a => (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />
                  <p style={{ fontSize:11, color:'#555', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
                </div>
              ))}
            </div>
          </Link>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            { href:'/mobile/checklist',   label: isHK ? 'Checklist HK' : 'Checklist PM' },
            { href:'/mobile/work-orders', label: 'Work Order' },
            { href:'/mobile/materials',   label: 'Request Material' },
            { href: isSPV ? '/mobile/approvals' : '/mobile/monitoring', label: isSPV ? 'Approval' : 'Monitoring' },
          ].map(q => (
            <Link key={q.href} href={q.href} style={{ textDecoration:'none' }}>
              <div style={{ background:'#fff', border:'1px solid #ebebeb', borderRadius:10, padding:14 }}>
                <p style={{ fontSize:12, fontWeight:500, color:'#111', margin:0 }}>{q.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {tasks.length > 0 && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <p style={{ fontSize:13, fontWeight:500, color:'#111', margin:0 }}>Task Hari Ini</p>
              <Link href="/mobile/checklist" style={{ fontSize:11, color:'#aaa', textDecoration:'none' }}>Lihat semua →</Link>
            </div>
            {tasks.map(t => (
              <div key={t.id} style={{ background:'#fff', border:'1px solid #ebebeb', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background: t.status==='completed'?'#22c55e':t.status==='in_progress'?'#3b82f6':'#e5e5e5' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:500, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{t.title || t.template_name || 'Task'}</p>
                  <p style={{ fontSize:10, color:'#aaa', margin:'2px 0 0' }}>{t.status}</p>
                </div>
              </div>
            ))}
          </>
        )}

      </MobileLayout>
    </>
  )
}