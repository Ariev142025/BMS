import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { authApi } from '@/lib/api'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Password tidak sama'); return }
    if (password.length < 8) { setError('Password minimal 8 karakter'); return }
    if (!token || typeof token !== 'string') { setError('Token tidak valid'); return }
    setLoading(true); setError('')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Token tidak valid atau sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Reset Password — SOMA BMS</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-teal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">SOMA BMS</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {!done ? (
              <>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm text-center">❌ {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password Baru</label>
                    <input type="password" className="input-field" required minLength={8}
                      placeholder="Minimal 8 karakter"
                      value={password} onChange={e => setPassword(e.target.value)} autoFocus />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Konfirmasi Password</label>
                    <input type="password" className="input-field" required
                      placeholder="Ulangi password baru"
                      value={confirm} onChange={e => setConfirm(e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading || !token}
                    className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50">
                    {loading ? '⏳ Menyimpan...' : '🔐 Simpan Password Baru'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">✅</p>
                <h3 className="font-bold text-gray-800 mb-2">Password Berhasil Diubah!</h3>
                <p className="text-sm text-gray-500 mb-4">Silakan login dengan password baru Anda.</p>
                <Link href="/login" className="btn-primary block text-center py-2.5">Login Sekarang</Link>
              </div>
            )}
            {!done && (
              <div className="mt-5 text-center">
                <Link href="/login" className="text-sm text-teal-600 hover:underline">← Kembali ke Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
