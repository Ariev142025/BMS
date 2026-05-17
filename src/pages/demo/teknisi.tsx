import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'

// Load without SSR because it uses browser-only features
const MobileApp = dynamic(
  () => import('../../components/AllDashboards').then(m => m.MobileApp),
  { ssr: false, loading: () => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'system-ui'}}>
      <p style={{color:'#64748b'}}>Memuat demo...</p>
    </div>
  )}
)

export default function DemoTeknisi() {
  return (
    <>
      <Head>
        <title>Demo Teknisi MEP — SOMA BMS</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{position:'fixed',top:12,left:12,zIndex:9999}}>
        <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',
          borderRadius:8,background:'rgba(0,0,0,0.7)',color:'white',
          textDecoration:'none',fontSize:12,fontWeight:700,backdropFilter:'blur(8px)'}}>
          ← Kembali ke Landing
        </Link>
      </div>
      <MobileApp onBack={() => { window.location.href = '/' }} initialRole="teknisi" />
    </>
  )
}
