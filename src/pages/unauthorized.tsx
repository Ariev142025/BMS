import Link from 'next/link'
export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Link href="/" className="btn-primary inline-block px-6 py-2.5">Kembali ke Dasbor</Link>
      </div>
    </div>
  )
}
