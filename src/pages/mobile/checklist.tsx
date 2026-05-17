import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MobileLayout } from '@/components/layout/MobileLayout'
import { tasksApi } from '@/lib/api'

function StatusBadge({ s }: { s: string }) {
  const c: Record<string,string> = { completed:'badge-green',in_progress:'badge-blue',assigned:'badge-yellow',overdue:'badge-red' }
  const l: Record<string,string> = { completed:'✅ Selesai',in_progress:'🔄 Dikerjakan',assigned:'📋 Menunggu',overdue:'⚠️ Terlambat' }
  return <span className={`${c[s]||'badge-gray'} text-xs`}>{l[s]||s}</span>
}

export default function MobileChecklist() {
  const { user, loading, logout } = useAuth(['teknisi','housekeeping','spv_teknisi','spv_housekeeping','building_admin'])
  const [tasks, setTasks] = useState<any[]>([])
  const [activeTask, setActiveTask] = useState<any>(null)
  const [stepResults, setStepResults] = useState<any[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [sectionIndex, setSectionIndex] = useState(0)
  const [materialsUsed, setMaterialsUsed] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!user) return
    tasksApi.myTasks({ task_date: new Date().toISOString().split('T')[0] })
      .then(r => setTasks(r.data))
      .finally(() => setBusy(false))
  }, [user])

  const checklistTasks = tasks.filter(t =>
    t.template_snapshot?.template_type === 'checklist' ||
    !t.template_snapshot?.template_type
  )

  const startTask = async (task: any) => {
    if (task.status === 'completed') return
    try {
      await tasksApi.start(task.id)
      setActiveTask(task)
      // Build flat step list from sections
      const sections = task.template_snapshot?.sections || []
      const allResults: any[] = []
      sections.forEach((sec: any, si: number) => {
        (sec.steps||[]).forEach((_: any, xi: number) => {
          allResults.push({ section_index: si, step_index: xi, value: null, photo_url: null })
        })
      })
      setStepResults(allResults)
      setSectionIndex(0)
      setStepIndex(0)
      setNote('')
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal memulai task') }
  }

  const completeTask = async () => {
    if (!activeTask) return
    setSubmitting(true)
    try {
      await tasksApi.complete(activeTask.id, { results: stepResults, materials_used: materialsUsed, notes: note })
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: 'completed' } : t))
      setActiveTask(null)
      setMaterialsUsed([])
    } catch (e: any) { alert(e.response?.data?.detail || 'Gagal menyelesaikan') }
    finally { setSubmitting(false) }
  }

  // Flatten sections into steps
  const getFlatSteps = (task: any) => {
    const sections = task?.template_snapshot?.sections || []
    const flat: any[] = []
    sections.forEach((sec: any, si: number) => {
      (sec.steps||[]).forEach((step: any, xi: number) => {
        flat.push({ ...step, section_title: sec.title, section_index: si, step_in_section: xi })
      })
    })
    return flat
  }

  if (loading) return null
  if (!user) return null

  // Active task view - Step by Step
  if (activeTask) {
    const steps = getFlatSteps(activeTask)
    const totalSteps = steps.length
    const currentStep = steps[stepIndex]
    const progress = Math.round((stepResults.filter(r => r.value !== null).length / totalSteps) * 100)

    const setCurrentValue = (value: any) => {
      setStepResults(prev => prev.map((r, i) => i === stepIndex ? { ...r, value } : r))
    }

    const goNext = () => {
      if (!currentStep.required && stepResults[stepIndex].value === null) {
        setStepResults(prev => prev.map((r, i) => i === stepIndex ? { ...r, value: 'skipped' } : r))
      }
      if (stepIndex < totalSteps - 1) setStepIndex(i => i + 1)
    }

    const goPrev = () => { if (stepIndex > 0) setStepIndex(i => i - 1) }

    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col">
        {/* Header */}
        <div className="bg-navy text-white px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setActiveTask(null)} className="text-white/80">← Kembali</button>
            <p className="text-sm font-medium">{activeTask.template_snapshot?.name}</p>
            <span className="text-xs text-gray-400">{stepIndex+1}/{totalSteps}</span>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div className="bg-teal-400 h-2 rounded-full transition-all" style={{width:`${progress}%`}}/>
          </div>
        </div>

        {/* Sections */}
        <div className="px-4 py-2 bg-gray-100 overflow-x-auto flex gap-2">
          {(activeTask.template_snapshot?.sections||[]).map((sec: any, si: number) => {
            const secSteps = getFlatSteps(activeTask).filter((s: any) => s.section_index === si)
            const secDone = stepResults.filter((_r, i) => steps[i]?.section_index === si && stepResults[i]?.value !== null).length
            return (
              <div key={si} className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg ${si === steps[stepIndex]?.section_index ? 'bg-teal-600 text-white' : 'bg-white text-gray-500'}`}>
                {secDone === secSteps.length ? '✅' : '○'} {sec.title}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 px-4 py-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-teal-600 font-medium mb-1">{currentStep?.section_title}</p>
            <p className="text-base font-semibold text-gray-800 mb-4">{currentStep?.instruction}</p>

            {/* Input Types */}
            {currentStep?.input_type === 'checkbox' && (
              <div className="space-y-2">
                {(currentStep.options||['Selesai']).map((opt: string) => (
                  <button key={opt} onClick={() => setCurrentValue(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${stepResults[stepIndex]?.value === opt ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    {stepResults[stepIndex]?.value === opt ? '✅ ' : '○ '}{opt}
                  </button>
                ))}
              </div>
            )}

            {currentStep?.input_type === 'radio' && (
              <div className="space-y-2">
                {(currentStep.options||[]).map((opt: string) => (
                  <button key={opt} onClick={() => setCurrentValue(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${stepResults[stepIndex]?.value === opt ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    {stepResults[stepIndex]?.value === opt ? '🔵 ' : '○ '}{opt}
                  </button>
                ))}
              </div>
            )}

            {currentStep?.input_type === 'numeric' && (
              <div>
                <input type="number" className="mobile-input text-lg font-medium"
                  placeholder={`Masukkan nilai ${currentStep.unit ? `(${currentStep.unit})` : ''}`}
                  value={stepResults[stepIndex]?.value||''}
                  onChange={e => setCurrentValue(e.target.value)}
                  min={currentStep.min_value} max={currentStep.max_value}
                />
                {(currentStep.min_value !== null && currentStep.max_value !== null) && (
                  <p className="text-xs text-gray-400 mt-1">Target: {currentStep.min_value}–{currentStep.max_value} {currentStep.unit}</p>
                )}
              </div>
            )}

            {currentStep?.input_type === 'text' && (
              <textarea className="mobile-input" rows={3}
                placeholder={currentStep.placeholder || 'Ketik nilai...'}
                value={stepResults[stepIndex]?.value||''}
                onChange={e => setCurrentValue(e.target.value)}
              />
            )}

            {currentStep?.input_type === 'photo' && (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50">
                  <p className="text-4xl mb-3">📷</p>
                  <p className="text-sm text-gray-500 mb-3">Ambil foto untuk langkah ini</p>
                  <button onClick={() => setCurrentValue('photo_taken')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${stepResults[stepIndex]?.value ? 'bg-green-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                    {stepResults[stepIndex]?.value ? '✅ Foto Diambil' : '📸 Simulasi Ambil Foto'}
                  </button>
                </div>
              </div>
            )}

            {/* Material used for this step */}
            {(activeTask.template_snapshot?.default_materials||[]).length > 0 && stepIndex === totalSteps - 1 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-medium text-blue-700 mb-2">📦 Material yang Digunakan</p>
                {(activeTask.template_snapshot.default_materials||[]).map((mat: any, mi: number) => (
                  <div key={mi} className="flex items-center gap-2 py-1">
                    <input type="checkbox" id={`mat-${mi}`}
                      checked={materialsUsed.some((m: any) => m.name === mat.name)}
                      onChange={e => {
                        if (e.target.checked) setMaterialsUsed(p => [...p, { name: mat.name, qty: mat.default_qty, unit: mat.unit }])
                        else setMaterialsUsed(p => p.filter((m: any) => m.name !== mat.name))
                      }} className="rounded"/>
                    <label htmlFor={`mat-${mi}`} className="text-xs text-blue-800">{mat.name} ({mat.default_qty} {mat.unit})</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes (last step) */}
          {stepIndex === totalSteps - 1 && (
            <div className="mt-3">
              <textarea className="mobile-input" rows={2} placeholder="Catatan tambahan (opsional)..."
                value={note} onChange={e => setNote(e.target.value)}/>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-2">
          {stepIndex === totalSteps - 1 ? (
            <button onClick={completeTask} disabled={submitting}
              className="mobile-btn bg-green-600 hover:bg-green-700">
              {submitting ? 'Menyimpan...' : '✅ Selesaikan Checklist'}
            </button>
          ) : (
            <button onClick={goNext}
              disabled={currentStep?.required && !stepResults[stepIndex]?.value}
              className="mobile-btn">
              Selanjutnya →
            </button>
          )}
          {stepIndex > 0 && (
            <button onClick={goPrev} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              ← Kembali
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Head><title>Checklist — SOMA BMS</title></Head>
      <MobileLayout user={user} onLogout={logout} title="Checklist Hari Ini">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {checklistTasks.filter(t=>t.status==='completed').length}/{checklistTasks.length} selesai
            </p>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID')}</span>
          </div>

          {busy ? (
            <div className="text-center py-12 text-gray-400">⏳ Memuat tugas...</div>
          ) : checklistTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-500 font-medium">Tidak ada checklist hari ini</p>
              <p className="text-xs text-gray-400 mt-1">Pastikan jadwal sudah dikonfigurasi oleh admin</p>
            </div>
          ) : checklistTasks.map(task => {
            const snap = task.template_snapshot || {}
            const stepCount = (snap.sections||[]).reduce((a: number, s: any) => a + (s.steps?.length||0), 0)
            const isDone = task.status === 'completed'
            const isOverdue = task.status === 'overdue'

            return (
              <div key={task.id} className={`mobile-card ${isOverdue ? 'border-red-200 bg-red-50' : isDone ? 'border-green-200 bg-green-50' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{snap.name || 'Checklist'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{snap.category} · {stepCount} langkah · ~{snap.estimated_duration_minutes||15} menit</p>
                  </div>
                  <StatusBadge s={task.status}/>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>⏰ {new Date(task.due_date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
                  {task.asset_id && <span>🏗️ Aset terkait</span>}
                </div>

                {!isDone ? (
                  <button onClick={() => startTask(task)}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${isOverdue ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                    {task.status === 'in_progress' ? '▶ Lanjutkan' : isOverdue ? '⚠️ Kerjakan Sekarang' : '▶ Mulai Checklist'}
                  </button>
                ) : (
                  <div className="text-center py-2 text-green-600 text-sm font-medium">
                    ✅ Selesai pukul {task.completed_at ? new Date(task.completed_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '—'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </MobileLayout>
    </>
  )
}
