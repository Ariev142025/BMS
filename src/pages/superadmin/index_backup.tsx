import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { superAdminApi } from '@/lib/api'
import { BarChart2, Building2, Users, DollarSign, LogOut, LayoutGrid, TrendingUp, TrendingDown, MoreVertical, Search, Filter, ChevronRight, Shield, Bell, Settings } from 'lucide-react'

const rp = (v: number) => `Rp${(v||0).toLocaleString('id-ID')}`
const STATUS_COLOR: Record<string,{bg:string,text:string}> = {
  trial:     { bg:'#eff6ff', text:'#1d4ed8' },
  active:    { bg:'#f0fdf4', text:'#166534' },
  past_due:  { bg:'#fef2f2', text:'#dc2626' },
  suspended: { bg:'#f5f5f5', text:'#555' },
  cancelled: { bg:'#fef2f2', text:'#dc2626' },
}
const PLAN_COLOR: Record<string,string> = { starter:'#8b5cf6', professional:'#0ea5e9', enterprise:'#f97316' }

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth(['super_admin'])
  const [stats, setStats] = useState<any>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [busy, setBusy] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [editSub, setEditSub] = useState({ plan: '', status: '', extend_days: 0 })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'overview'|'companies'>('overview')

  const fetchAll = async () => {
    if (!user) return
    try {
      const [s, c] = await Promise.all([superAdminApi.stats(), superAdminApi.companies()])
      setStats(s.data); setCompanies(Array.isArray(c.data) ? c.data : c.data?.items || [])
    } finally { setBusy(false) }
  }

  const openDetail = async (id: string) => {
    const { data } = await superAdminApi.getCompany(id)
    setSelected(data)
    setEditSub({ plan: data.subscription?.plan || 'starter', status: data.subscription?.status || 'trial', extend_days: 30 })
  }

  const saveSubscription = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const payload: any = { plan: editSub.plan, status: editSub.status }
      if (editSub.extend_days > 0) payload.extend_days = editSub.extend_days
      await superAdminApi.updateSubscription(selected.id, payload)
      const { data } = await superAdminApi.getCompany(selected.id)
      setSelected(data); fetchAll()
      alert('✅ Subscription diperbarui')
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSaving(false) }
  }

  const toggleCompany = async (id: string) => {
    await superAdminApi.toggleCompany(id); fetchAll()
    if (selected?.id === id) { const { data } = await superAdminApi.getCompany(id); setSelected(data) }
  }

  useEffect(() => { if (user) fetchAll() }, [user])

  const filtered = companies.filter(c =>
    (!search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterPlan || c.subscription?.plan === filterPlan) &&
    (!filterStatus || c.subscription?.status === filterStatus)
  )

  if (loading || busy) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f0a1e', color:'#fff', fontSize:13 }}>
      Memuat Super Admin...
    </div>
  )
  if (!user) return null

  const PURPLE = '#7c3aed'
  const DARK = '#0f0a1e'
  const CARD = '#1a1035'
  const BORDER = '#2d2150'

  return (
    <>
      <Head><title>Super Admin — SOMA BMS</title></Head>
      <div style={{ display:'flex', height:'100vh', background:DARK, overflow:'hidden', fontFamily:'-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width:240, background:'#130d2a', borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
          {/* Logo */}
          <div style={{ padding:'24px 20px 20px', borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, background:PURPLE, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Shield size={18} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0 }}>SOMA BMS</p>
                <p style={{ fontSize:10, color:'#a78bfa', margin:0 }}>Super Admin</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
            {[
              { key:'overview',   icon: LayoutGrid,  label:'Overview' },
              { key:'companies',  icon: Building2,   label:'Semua Company' },
            ].map(item => {
              const Icon = item.icon
              const active = tab === item.key
              return (
                <button key={item.key} onClick={() => setTab(item.key as any)} style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderRadius:10, border:'none', cursor:'pointer', marginBottom:2,
                  background: active ? PURPLE : 'transparent',
                  color: active ? '#fff' : '#8b7db8',
                  fontWeight: active ? 600 : 400, fontSize:13, textAlign:'left',
                  transition:'all .15s',
                }}>
                  <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={14} style={{ marginLeft:'auto', opacity:.6 }} />}
                </button>
              )
            })}
          </nav>

          {/* Stats mini */}
          <div style={{ padding:'12px 16px', background:'#0d0820', margin:'0 10px 10px', borderRadius:12 }}>
            <p style={{ fontSize:10, color:'#8b7db8', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:.5 }}>Platform Stats</p>
            {[
              { label:'Companies', value: stats?.companies?.total ?? '—' },
              { label:'Users', value: stats?.users?.total ?? '—' },
              { label:'MRR', value: rp(stats?.revenue?.mrr || 0) },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, color:'#8b7db8' }}>{s.label}</span>
                <span style={{ fontSize:11, fontWeight:600, color:'#c4b5fd' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* User */}
          <div style={{ padding:'12px 10px', borderTop:`1px solid ${BORDER}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', marginBottom:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:PURPLE, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {user.full_name?.slice(0,2).toUpperCase() || 'SA'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#fff', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.full_name}</p>
                <p style={{ fontSize:10, color:'#a78bfa', margin:0 }}>super_admin</p>
              </div>
            </div>
            <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:10, border:'none', background:'transparent', cursor:'pointer', fontSize:12, color:'#8b7db8', textAlign:'left' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,.15)'; e.currentTarget.style.color='#c4b5fd' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8b7db8' }}
            >
              <LogOut size={14} /><span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Topbar */}
          <header style={{ background:'#130d2a', borderBottom:`1px solid ${BORDER}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <h1 style={{ fontSize:15, fontWeight:600, color:'#fff', margin:0 }}>
              {tab === 'overview' ? 'Platform Overview' : 'Company Management'}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.05)', border:`1px solid ${BORDER}`, borderRadius:10, padding:'8px 14px' }}>
                <Search size={15} color="#8b7db8" />
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:'#fff', width:140 }} />
              </div>
              <button style={{ width:36, height:36, borderRadius:10, border:`1px solid ${BORDER}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
                <Bell size={16} color="#8b7db8" />
                <span style={{ position:'absolute', top:8, right:8, width:6, height:6, background:PURPLE, borderRadius:'50%' }} />
              </button>
              <div style={{ padding:'6px 12px', borderRadius:10, background:'rgba(124,58,237,.2)', border:`1px solid ${PURPLE}`, fontSize:11, fontWeight:600, color:'#c4b5fd' }}>
                ⚡ Super Admin
              </div>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex:1, overflowY:'auto', padding:24 }}>

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div>
                {/* KPI */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                  {[
                    { label:'Total Company',  value: stats?.companies?.total ?? 0,  icon: Building2,  trend:'+12%', positive:true },
                    { label:'Total Gedung',   value: stats?.buildings?.total ?? 0,   icon: LayoutGrid, trend:'+8%',  positive:true },
                    { label:'Total Pengguna', value: stats?.users?.total ?? 0,       icon: Users,      trend:'+5%',  positive:true },
                    { label:'MRR',            value: rp(stats?.revenue?.mrr || 0),   icon: DollarSign, trend:'+15%', positive:true },
                  ].map((k,i) => {
                    const Icon = k.icon
                    return (
                      <div key={i} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(124,58,237,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Icon size={18} color="#a78bfa" strokeWidth={1.5} />
                          </div>
                          <MoreVertical size={14} color="#4a3a6a" />
                        </div>
                        <p style={{ fontSize:28, fontWeight:700, color:'#fff', margin:'0 0 4px', lineHeight:1 }}>{k.value}</p>
                        <p style={{ fontSize:12, color:'#8b7db8', margin:0 }}>{k.label}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:10 }}>
                          {k.positive ? <TrendingUp size={12} color="#22c55e" /> : <TrendingDown size={12} color="#ef4444" />}
                          <span style={{ fontSize:11, fontWeight:600, color: k.positive ? '#22c55e' : '#ef4444' }}>{k.trend}</span>
                          <span style={{ fontSize:11, color:'#6b5a8a' }}>vs bulan lalu</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Middle */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  {/* Subscription breakdown */}
                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 24px' }}>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'#fff', margin:'0 0 20px' }}>Subscription Status</h3>
                    {[
                      { label:'Active',    count: stats?.subscriptions?.active || 0,   color:'#22c55e' },
                      { label:'Trial',     count: stats?.subscriptions?.trial || 0,    color:'#3b82f6' },
                      { label:'Past Due',  count: stats?.subscriptions?.past_due || 0, color:'#ef4444' },
                      { label:'Suspended', count: (stats?.subscriptions?.suspended || 0) + (stats?.subscriptions?.cancelled || 0), color:'#6b7280' },
                    ].map(s => {
                      const total = stats?.companies?.total || 1
                      const pct = Math.round(s.count / total * 100)
                      return (
                        <div key={s.label} style={{ marginBottom:16 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />
                              <span style={{ fontSize:13, color:'#c4b5fd' }}>{s.label}</span>
                            </div>
                            <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{s.count}</span>
                          </div>
                          <div style={{ height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct}%`, background:s.color, borderRadius:3 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Revenue */}
                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px 24px' }}>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'#fff', margin:'0 0 20px' }}>Revenue</h3>
                    {[
                      { label:'MRR (Monthly Recurring)', value: rp(stats?.revenue?.mrr || 0), highlight: true },
                      { label:'Bulan Ini',              value: rp(stats?.revenue?.this_month || 0) },
                      { label:'All-time Total',         value: rp(stats?.revenue?.total_all_time || 0) },
                    ].map(r => (
                      <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:`1px solid ${BORDER}` }}>
                        <span style={{ fontSize:13, color:'#8b7db8' }}>{r.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color: r.highlight ? '#a78bfa' : '#fff' }}>{r.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:16, padding:'12px', background:'rgba(124,58,237,.1)', borderRadius:10, border:`1px solid rgba(124,58,237,.3)` }}>
                      <p style={{ fontSize:11, color:'#a78bfa', margin:0 }}>💡 {stats?.companies?.active || 0} company aktif berkontribusi ke MRR</p>
                    </div>
                  </div>
                </div>

                {/* Recent companies table */}
                <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, overflow:'hidden' }}>
                  <div style={{ padding:'16px 24px', borderBottom:`1px solid ${BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'#fff', margin:0 }}>Company Terbaru</h3>
                    <button onClick={() => setTab('companies')} style={{ fontSize:11, color:'#a78bfa', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                      Lihat Semua →
                    </button>
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                        {['Company','Paket','Status','Gedung','User','Daftar'].map(h => (
                          <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#6b5a8a', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {companies.slice(0,5).map(c => (
                        <tr key={c.id} style={{ borderBottom:`1px solid rgba(45,33,80,.5)`, cursor:'pointer', transition:'background .15s' }}
                          onClick={() => { openDetail(c.id); setTab('companies') }}
                          onMouseEnter={e => (e.currentTarget.style.background='rgba(124,58,237,.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}
                        >
                          <td style={{ padding:'12px 16px' }}>
                            <p style={{ fontWeight:600, color:'#fff', margin:0 }}>{c.name}</p>
                            <p style={{ fontSize:11, color:'#6b5a8a', margin:'2px 0 0' }}>{c.email}</p>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:`${PLAN_COLOR[c.subscription?.plan] || '#555'}22`, color: PLAN_COLOR[c.subscription?.plan] || '#aaa' }}>
                              {c.subscription?.plan || '—'}
                            </span>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            {c.subscription?.status && (
                              <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background: STATUS_COLOR[c.subscription.status]?.bg || '#f5f5f5', color: STATUS_COLOR[c.subscription.status]?.text || '#555' }}>
                                {c.subscription.status}
                              </span>
                            )}
                          </td>
                          <td style={{ padding:'12px 16px', color:'#c4b5fd', fontSize:13 }}>{c.buildings}</td>
                          <td style={{ padding:'12px 16px', color:'#c4b5fd', fontSize:13 }}>{c.users}</td>
                          <td style={{ padding:'12px 16px', color:'#6b5a8a', fontSize:12 }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPANIES */}
            {tab === 'companies' && (
              <div style={{ display:'flex', gap:20 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  {/* Filter */}
                  <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
                    <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:'8px 12px', color:'#c4b5fd', fontSize:13, outline:'none' }}>
                      <option value="">Semua Paket</option>
                      {['starter','professional','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:'8px 12px', color:'#c4b5fd', fontSize:13, outline:'none' }}>
                      <option value="">Semua Status</option>
                      {['trial','active','past_due','suspended','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span style={{ fontSize:12, color:'#6b5a8a', alignSelf:'center' }}>{filtered.length} company</span>
                  </div>

                  <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                      <thead>
                        <tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                          {['Company','Paket','Status','Gedung','User','Aktif','Aksi'].map(h => (
                            <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#6b5a8a', textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.length === 0 ? (
                          <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#6b5a8a', fontSize:13 }}>Tidak ada company</td></tr>
                        ) : filtered.map(c => (
                          <tr key={c.id} style={{ borderBottom:`1px solid rgba(45,33,80,.5)`, cursor:'pointer', background: selected?.id === c.id ? 'rgba(124,58,237,.1)' : 'transparent', transition:'background .15s' }}
                            onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background='rgba(255,255,255,.03)' }}
                            onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background='transparent' }}
                          >
                            <td style={{ padding:'12px 16px' }}>
                              <p style={{ fontWeight:600, color:'#fff', margin:0 }}>{c.name}</p>
                              <p style={{ fontSize:11, color:'#6b5a8a', margin:'2px 0 0' }}>{c.email}</p>
                            </td>
                            <td style={{ padding:'12px 16px' }}>
                              <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background:`${PLAN_COLOR[c.subscription?.plan]||'#555'}22`, color: PLAN_COLOR[c.subscription?.plan]||'#aaa' }}>
                                {c.subscription?.plan || '—'}
                              </span>
                            </td>
                            <td style={{ padding:'12px 16px' }}>
                              {c.subscription?.status && (
                                <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background: STATUS_COLOR[c.subscription.status]?.bg, color: STATUS_COLOR[c.subscription.status]?.text }}>
                                  {c.subscription.status}
                                </span>
                              )}
                            </td>
                            <td style={{ padding:'12px 16px', color:'#c4b5fd' }}>{c.buildings}</td>
                            <td style={{ padding:'12px 16px', color:'#c4b5fd' }}>{c.users}</td>
                            <td style={{ padding:'12px 16px' }}>
                              <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:20, background: c.is_active ? '#f0fdf4' : '#f5f5f5', color: c.is_active ? '#166534' : '#555' }}>
                                {c.is_active ? 'Aktif' : 'Suspend'}
                              </span>
                            </td>
                            <td style={{ padding:'12px 16px' }}>
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={() => openDetail(c.id)} style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:`1px solid ${BORDER}`, background:'rgba(124,58,237,.15)', color:'#a78bfa', cursor:'pointer', fontWeight:600 }}>
                                  Detail
                                </button>
                                <button onClick={() => toggleCompany(c.id)} style={{ fontSize:11, padding:'5px 10px', borderRadius:8, border:'none', background: c.is_active ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.15)', color: c.is_active ? '#ef4444' : '#22c55e', cursor:'pointer', fontWeight:600 }}>
                                  {c.is_active ? 'Suspend' : 'Aktifkan'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detail panel */}
                {selected && (
                  <div style={{ width:300, flexShrink:0 }}>
                    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px', marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                        <div>
                          <h3 style={{ fontWeight:700, color:'#fff', margin:0, fontSize:15 }}>{selected.name}</h3>
                          <p style={{ fontSize:11, color:'#6b5a8a', margin:'3px 0 0' }}>{selected.email}</p>
                        </div>
                        <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b5a8a', fontSize:18 }}>✕</button>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
                        {[['Gedung', selected.buildings?.length], ['Users', selected.users_count]].map(([l, v]) => (
                          <div key={String(l)} style={{ background:'rgba(124,58,237,.1)', borderRadius:10, padding:'10px', textAlign:'center' }}>
                            <p style={{ fontSize:20, fontWeight:700, color:'#a78bfa', margin:0 }}>{v}</p>
                            <p style={{ fontSize:11, color:'#6b5a8a', margin:'4px 0 0' }}>{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Edit subscription */}
                    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'20px', marginBottom:12 }}>
                      <h3 style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 16px' }}>Edit Subscription</h3>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {[
                          { label:'Paket', key:'plan', options:['starter','professional','enterprise'] },
                          { label:'Status', key:'status', options:['trial','active','past_due','suspended','cancelled'] },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize:11, color:'#8b7db8', display:'block', marginBottom:4 }}>{f.label}</label>
                            <select value={(editSub as any)[f.key]} onChange={e => setEditSub(s => ({ ...s, [f.key]: e.target.value }))}
                              style={{ width:'100%', background:'#0d0820', border:`1px solid ${BORDER}`, borderRadius:8, padding:'8px 10px', color:'#c4b5fd', fontSize:13, outline:'none' }}>
                              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize:11, color:'#8b7db8', display:'block', marginBottom:4 }}>Perpanjang (hari)</label>
                          <input type="number" min={0} value={editSub.extend_days} onChange={e => setEditSub(s => ({ ...s, extend_days: parseInt(e.target.value)||0 }))}
                            style={{ width:'100%', background:'#0d0820', border:`1px solid ${BORDER}`, borderRadius:8, padding:'8px 10px', color:'#c4b5fd', fontSize:13, outline:'none' }} />
                        </div>
                        <button onClick={saveSubscription} disabled={saving} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background: saving ? '#4a3a6a' : PURPLE, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer', marginTop:4 }}>
                          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
