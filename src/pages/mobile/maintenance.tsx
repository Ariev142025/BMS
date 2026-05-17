import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { tasksApi } from '@/lib/api'

export default function MobileMaintenance() {
  const { user, loading, logout } = useAuth(['teknisi','spv_teknisi','building_admin'])
  const [tasks, setTasks] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [activeTask, setActiveTask] = useState<any>(null)
  const [stepResults, setStepResults] = useState<any[]>([])
  const [stepIdx, setStepIdx] = useState(0)
  const [materialsUsed, setMaterialsUsed] = useState<any[]>([])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    tasksApi.myTasks({ task_date: new Date().toISOString().split('T')[0] })
      .then(r => setTasks(r.data.filter((t: any) => t.template_snapshot?.template_type === 'maintenance')))
      .finally(() => setBusy(false))
  }, [user])

  const getFlatSteps = (task: any) => {
    const sections = task?.template_snapshot?.sections || []
    const flat: any[] = []
    sections.forEach((sec: any, si: number) => {
      (sec.steps||[]).forEach((step: any) => flat.push({ ...step, section_title: sec.title, si }))
    })
    return flat
  }

  const startTask = async (task: any) => {
    if (task.status === 'completed') return
    await tasksApi.start(task.id)
    setActiveTask(task)
    const steps = getFlatSteps(task)
    setStepResults(steps.map(() => ({ value: null })))
    setStepIdx(0)
    setNote('')
    // Load default materials
    const mats = task.template_snapshot?.default_materials || []
    setMaterialsUsed(mats.map((m: any) => ({ ...m, included: false })))
  }

  const completeTask = async () => {
    if (!activeTask) return
    setSubmitting(true)
    try {
      const usedMats = materialsUsed.filter((m: any) => m.included).map((m: any) => ({ name: m.name, qty: m.default_qty, unit: m.unit }))
      await tasksApi.complete(activeTask.id, { results: stepResults, materials_used: usedMats, notes: note })
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: 'completed' } : t))
      setActiveTask(null)
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal') }
    finally { setSubmitting(false) }
  }

  if (loading) return null
  if (!user) return null

  if (activeTask) {
    const steps = getFlatSteps(activeTask)
    const totalSteps = steps.length
    const currentStep = steps[stepIdx]
    const progress = Math.round(stepResults.filter(r => r.value !== null).length / Math.max(totalSteps, 1) * 100)

    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
        <header className="bg-[#1a2b4a] text-white px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setActiveTask(null)} className="text-white/70">←</button>
            <div className="flex-1">
              <p className="font-bold text-sm">{activeTask.template_snapshot?.name}</p>
              <p className="text-xs text-gray-300">{currentStep?.section_title} · Langkah {stepIdx+1}/{totalSteps}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-1.5">
            <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{width:`${progress}%`}}/>
          </div>
          <p className="text-xs text-right mt-1 text-amber-300">{progress}% selesai</p>
        </header>

        <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <p className="text-xs text-amber-600 font-semibold mb-1">🛠️ {currentStep?.section_title}</p>
            <p className="text-base font-semibold text-gray-800 mb-4">{currentStep?.instruction}</p>

            {currentStep?.input_type === 'radio' && (
              <div className="space-y-2">
                {(currentStep.options||[]).map((opt: string) => (
                  <button key={opt} onClick={() => setStepResults(p=>p.map((r,i)=>i===stepIdx?{...r,value:opt}:r))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${stepResults[stepIdx]?.value===opt?'border-amber-500 bg-amber-50 font-medium':'border-gray-200 hover:border-gray-300'}`}>
                    {stepResults[stepIdx]?.value===opt?'✅':'○'} {opt}
                  </button>
                ))}
              </div>
            )}

            {currentStep?.input_type === 'checkbox' && (
              <div className="space-y-2">
                {(currentStep.options||['Selesai']).map((opt: string) => (
                  <button key={opt} onClick={() => setStepResults(p=>p.map((r,i)=>i===stepIdx?{...r,value:opt}:r))}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${stepResults[stepIdx]?.value===opt?'border-green-500 bg-green-50 font-medium':'border-gray-200 hover:border-gray-300'}`}>
                    {stepResults[stepIdx]?.value===opt?'✅':'○'} {opt}
                  </button>
                ))}
              </div>
            )}

            {currentStep?.input_type === 'numeric' && (
              <div>
                <input type="number" className="mobile-input text-xl font-bold"
                  placeholder={`Nilai (${currentStep.unit||''})`}
                  value={stepResults[stepIdx]?.value||''}
                  onChange={e => setStepResults(p=>p.map((r,i)=>i===stepIdx?{...r,value:e.target.value}:r))}/>
                {currentStep.min_value != null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Rentang normal: {currentStep.min_value} – {currentStep.max_value} {currentStep.unit}
                    {stepResults[stepIdx]?.value && (
                      parseFloat(stepResults[stepIdx].value) >= currentStep.min_value && parseFloat(stepResults[stepIdx].value) <= currentStep.max_value
                        ? <span className="text-green-600 ml-2">✅ Normal</span>
                        : <span className="text-red-600 ml-2">⚠️ Di luar rentang!</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {currentStep?.input_type === 'photo' && (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm text-gray-500 mb-3">Diperlukan foto untuk langkah ini</p>
                <button onClick={() => setStepResults(p=>p.map((r,i)=>i===stepIdx?{...r,value:'photo_taken'}:r))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${stepResults[stepIdx]?.value?'bg-green-500 text-white':'bg-teal-600 text-white'}`}>
                  {stepResults[stepIdx]?.value?'✅ Foto Tersimpan':'📸 Ambil Foto'}
                </button>
              </div>
            )}
          </div>

          {/* Materials (last step) */}
          {stepIdx === totalSteps - 1 && materialsUsed.length > 0 && (
            <div className="mobile-card border-amber-100 bg-amber-50">
              <p className="text-sm font-semibold text-amber-800 mb-2">📦 Konfirmasi Material Dipakai</p>
              {materialsUsed.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <input type="checkbox" id={`m${i}`} checked={m.included}
                    onChange={e => setMaterialsUsed(p => p.map((mm, ii) => ii===i ? {...mm, included: e.target.checked} : mm))}
                    className="rounded w-4 h-4"/>
                  <label htmlFor={`m${i}`} className="text-sm text-amber-900">{m.name} — {m.default_qty} {m.unit}</label>
                </div>
              ))}
            </div>
          )}

          {stepIdx === totalSteps - 1 && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Temuan / Rekomendasi</label>
              <textarea className="mobile-input" rows={3} placeholder="Tuliskan temuan, kondisi tidak normal, atau rekomendasi..."
                value={note} onChange={e=>setNote(e.target.value)}/>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-white border-t border-gray-100">
          {stepIdx < totalSteps - 1 ? (
            <div className="flex gap-2">
              {stepIdx > 0 && <button onClick={() => setStepIdx(i=>i-1)} className="py-3 px-4 rounded-xl border border-gray-200 text-sm text-gray-600">←</button>}
              <button onClick={() => setStepIdx(i=>i+1)}
                disabled={currentStep?.required && !stepResults[stepIdx]?.value}
                className="flex-1 mobile-btn">Lanjut →</button>
            </div>
          ) : (
            <button onClick={completeTask} disabled={submitting} className="mobile-btn bg-green-600 hover:bg-green-700">
              {submitting?'Menyimpan...':'✅ Selesaikan Maintenance'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Maintenance — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Maintenance Rutin">
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-gray-500">{tasks.filter(t=>t.status==='completed').length}/{tasks.length} selesai</p>

          {busy ? <div className="text-center py-12 text-gray-400">⏳ Memuat...</div> :
           tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🛠️</p>
              <p className="text-gray-500">Tidak ada jadwal maintenance hari ini</p>
            </div>
          ) : tasks.map(task => {
            const snap = task.template_snapshot || {}
            const stepCount = (snap.sections||[]).reduce((a: number, s: any) => a + (s.steps?.length||0), 0)
            const isDone = task.status === 'completed'

            return (
              <div key={task.id} className={`mobile-card ${isDone?'bg-green-50 border-green-200':''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{snap.name}</p>
                    <p className="text-xs text-gray-500">{snap.category} · {stepCount} langkah</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ⏰ {new Date(task.due_date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                      {snap.estimated_duration_minutes && ` · ~${snap.estimated_duration_minutes} menit`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDone?'bg-green-100 text-green-700':task.status==='overdue'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>
                    {isDone?'✅ Selesai':task.status==='overdue'?'⚠️ Terlambat':'📋 Terjadwal'}
                  </span>
                </div>

                {snap.default_materials?.length > 0 && (
                  <p className="text-xs text-blue-600 mb-2">📦 Material: {snap.default_materials.map((m: any)=>m.name).join(', ')}</p>
                )}

                {!isDone && (
                  <button onClick={() => startTask(task)}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium ${task.status==='overdue'?'bg-red-600 text-white':'bg-amber-500 text-white'} hover:opacity-90`}>
                    🛠️ {task.status==='in_progress'?'Lanjutkan':'Mulai Maintenance'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </MobileLayout>
    </>
  )
}
