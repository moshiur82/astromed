import HumanBodyMap from './components/HumanBodyMap'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Logo from './components/Logo'

type Astronaut = { id: number; name: string; mission: string; role: string; status: string }
type Vital = { id: number; astronaut_id: number; heart_rate: number; spo2: number; temperature: number; systolic: number; diastolic: number; created_at: string }
type System = { id: number; system_name: string; status: string; value: string; unit: string }

function MiniChart(props: { data: any[], dataKey: string, color: string, domain: [number, number] }) {
  const data = props.data; const dataKey = props.dataKey; const color = props.color; const domain = props.domain
  if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-xs text-zinc-400">Need 2+ readings</div>
  const width = 300; const height = 120; const padding = 20
  const values = data.map((d: any) => d[dataKey]); const min = domain[0]; const max = domain[1]; const range = max - min || 1
  const vb = "0 0 " + width + " " + height
  const points = values.map((v: number, i: number) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return x + "," + y
  }).join(" ")
  return (
    <svg viewBox={vb} className="w-full h-full">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={points}></polyline>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#f4f4f5" strokeWidth="1"></line>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f4f4f5" strokeWidth="1"></line>
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState('overview')
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [vitals, setVitals] = useState<Vital[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [selectedAstronaut, setSelectedAstronaut] = useState<number>(1)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [isLive] = useState(true)
  const [search, setSearch] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const a = await supabase.from('astronauts').select('*').order('id')
      const v = await supabase.from('vital_signs').select('*').order('created_at')
      const s = await supabase.from('systems_status').select('*').order('id')
      if (a.data) setAstronauts(a.data)
      if (v.data) setVitals(v.data)
      if (s.data) setSystems(s.data)
    }
    fetchAll()
    const channel = supabase.channel('vitals-live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vital_signs' }, (payload: any) => {
      setVitals((prev: any) => [...prev, payload.new as Vital].slice(-100))
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (!isLive || astronauts.length === 0) return
    const id = window.setInterval(async () => {
      const astroId = astronauts[Math.floor(Math.random() * astronauts.length)].id
      const isAnomaly = Math.random() < 0.15
      const newVital = {
        astronaut_id: astroId,
        heart_rate: isAnomaly ? 105 + Math.floor(Math.random() * 10) : 70 + Math.floor(Math.random() * 12),
        spo2: isAnomaly ? 92 + Math.floor(Math.random() * 2) : 96 + Math.floor(Math.random() * 4),
        temperature: Number((isAnomaly ? 37.8 + Math.random() * 0.6 : 36.5 + Math.random() * 1).toFixed(1)),
        systolic: 115 + Math.floor(Math.random() * 15),
        diastolic: 75 + Math.floor(Math.random() * 10),
        respiratory_rate: 15 + Math.floor(Math.random() * 5)
      }
      await supabase.from('vital_signs').insert([newVital])
    }, 5000)
    return () => clearInterval(id)
  }, [isLive, astronauts])

  const filteredAstronauts = astronauts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.mission.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))
  const filteredVitals = vitals.filter(v => v.astronaut_id === selectedAstronaut).slice(-20)
  const latestVital = filteredVitals[filteredVitals.length - 1] as any
  const selectedAstro = astronauts.find(a => a.id === selectedAstronaut)
  const detailAstro = astronauts.find(a => a.id === detailId)
  const detailVitals = vitals.filter(v => v.astronaut_id === detailId).slice(-30)

  useEffect(() => {
    if (!latestVital) return
    const fetchAI = async () => {
      setAiLoading(true)
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heart_rate: latestVital.heart_rate,
            spo2: latestVital.spo2,
            temperature: latestVital.temperature,
            systolic: latestVital.systolic
          })
        })
        const data = await res.json()
        setAiResult(data)
      } catch (e) { setAiResult(null) }
      setAiLoading(false)
    }
    fetchAI()
  }, [latestVital])

  const alerts = vitals.slice(-15).flatMap((v: any) => {
    const a = astronauts.find(x => x.id === v.astronaut_id)
    const list: any[] = []
    if (v.heart_rate > 100) list.push({ id: v.id + "-hr-high", type: 'critical', message: "High HR " + v.heart_rate + " bpm - " + (a ? a.name : 'Crew'), time: v.created_at })
    if (v.heart_rate < 60) list.push({ id: v.id + "-hr-low", type: 'warning', message: "Low HR " + v.heart_rate + " bpm - " + (a ? a.name : 'Crew'), time: v.created_at })
    if (v.spo2 < 95) list.push({ id: v.id + "-spo2", type: 'critical', message: "Low SpO2 " + v.spo2 + "% - " + (a ? a.name : 'Crew'), time: v.created_at })
    if (v.temperature > 37.5) list.push({ id: v.id + "-temp", type: 'warning', message: "High Temp " + v.temperature + "C - " + (a ? a.name : 'Crew'), time: v.created_at })
    return list
  }).slice(-5).reverse()

  const exportCSV = () => {
    const headers = ['Time','Astronaut','Heart Rate','SpO2','Temp','BP']
    const rows = vitals.slice(-50).map((v: any) => {
      const a = astronauts.find(x => x.id === v.astronaut_id)
      const name = a ? a.name : String(v.astronaut_id)
      return [new Date(v.created_at).toLocaleString(), name, v.heart_rate, v.spo2, v.temperature, v.systolic + "/" + v.diastolic].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a'); el.href = url; el.download = "astromed-vitals-" + Date.now() + ".csv"; el.click()
  }

  if (detailId && detailAstro) {
    const latest = detailVitals[detailVitals.length - 1] as any
    return (
      <div className="min-h-screen bg-white text-zinc-900 antialiased">
        <header className="border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <button onClick={() => setDetailId(null)} className="text-sm px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50">Back to Crew</button>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-xs text-zinc-500">LIVE</span></div>
          </div>
        </header>
        {alerts.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
            <div className="space-y-2">
              {alerts.map((alert: any) => (
                <div key={alert.id} className={alert.type === 'critical' ? 'border rounded-xl p-3 flex justify-between items-center text-sm border-red-200 bg-red-50 text-red-700' : 'border rounded-xl p-3 flex justify-between items-center text-sm border-amber-200 bg-amber-50 text-amber-700'}>
                  <span className="font-medium">{alert.message}</span><span className="text-xs opacity-70">{new Date(alert.time).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">{detailAstro.name}</h1><p className="text-sm text-zinc-500 mt-2">{detailAstro.role} - {detailAstro.mission} - {detailAstro.status}</p></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="border border-zinc-200 rounded-xl p-4"><div className="text-xs uppercase text-zinc-400">Heart Rate</div><div className="text-xl font-semibold mt-1">{latest ? latest.heart_rate : '-'} bpm</div></div>
            <div className="border border-zinc-200 rounded-xl p-4"><div className="text-xs uppercase text-zinc-400">SpO2</div><div className="text-xl font-semibold mt-1">{latest ? latest.spo2 : '-'}%</div></div>
            <div className="border border-zinc-200 rounded-xl p-4"><div className="text-xs uppercase text-zinc-400">Temperature</div><div className="text-xl font-semibold mt-1">{latest ? latest.temperature : '-'}C</div></div>
            <div className="border border-zinc-200 rounded-xl p-4"><div className="text-xs uppercase text-zinc-400">Blood Pressure</div><div className="text-xl font-semibold mt-1">{latest ? latest.systolic + "/" + latest.diastolic : '-'}</div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-zinc-200 rounded-2xl p-4 md:p-6"><h3 className="text-sm font-semibold mb-4">Heart Rate</h3><div className="h-44 w-full"><MiniChart data={detailVitals} dataKey="heart_rate" color="#18181b" domain={[60, 115]} /></div></div>
            <div className="border border-zinc-200 rounded-2xl p-4 md:p-6"><h3 className="text-sm font-semibold mb-4">SpO2</h3><div className="h-44 w-full"><MiniChart data={detailVitals} dataKey="spo2" color="#18181b" domain={[90, 100]} /></div></div>
            <div className="border border-zinc-200 rounded-2xl p-4 md:p-6"><h3 className="text-sm font-semibold mb-4">Temperature</h3><div className="h-44 w-full"><MiniChart data={detailVitals} dataKey="temperature" color="#18181b" domain={[36, 39]} /></div></div>
            <div className="border border-zinc-200 rounded-2xl p-4 md:p-6"><h3 className="text-sm font-semibold mb-4">Systolic BP</h3><div className="h-44 w-full"><MiniChart data={detailVitals} dataKey="systolic" color="#52525b" domain={[110, 135]} /></div></div>
          </div>
          {/* ✅ NEW — Astrological Body Map */}
          <div className="mt-8">
            <HumanBodyMap />
          </div>
          <div className="mt-8 border border-zinc-900 rounded-2xl p-5 md:p-6 bg-zinc-900 text-white">
            <div className="flex justify-between items-start">
              <div><div className="text-xs uppercase text-zinc-400">AstroMed AI Prediction</div><div className="text-xl font-bold mt-2">{aiLoading ? 'Analyzing...' : aiResult ? aiResult.prediction : 'Loading...'}</div><div className="text-sm text-zinc-400 mt-1">{aiResult ? aiResult.recommendation : ''}</div></div>
              <div className="text-right"><div className="text-xs uppercase text-zinc-400">Risk Score</div><div className={aiResult && aiResult.risk_score >= 70 ? 'text-2xl font-bold mt-2 text-red-400' : aiResult && aiResult.risk_score >= 40 ? 'text-2xl font-bold mt-2 text-amber-400' : 'text-2xl font-bold mt-2 text-green-400'}>{aiResult ? aiResult.risk_score + '%' : '-'}</div><div className="text-xs text-zinc-400 mt-1">{aiResult ? aiResult.risk_status : ''} - {aiResult ? Math.round(aiResult.confidence*100) + '% confidence' : ''}</div></div>
            </div>
            <div className="mt-4 text-xs text-zinc-500">Model: {aiResult ? aiResult.model : 'AstroMed ML v1'} - Live Python API</div>
          </div>
          <div className="mt-8 border border-zinc-200 rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold">Recent Readings ({detailVitals.length})</h3><button onClick={exportCSV} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50">Export CSV</button></div>
            <div className="overflow-x-auto"><div className="min-w-"><div className="grid grid-cols-5 text-xs uppercase text-zinc-400 p-2 border-b"><div>Time</div><div>HR</div><div>SpO2</div><div>Temp</div><div>BP</div></div>{detailVitals.slice(-10).reverse().map((v: any)=>(<div key={v.id} className="grid grid-cols-5 text-sm p-2 border-b last:border-0"><div className="text-zinc-500">{new Date(v.created_at).toLocaleTimeString()}</div><div className={v.heart_rate>100 ? 'text-red-600 font-bold' : ''}>{v.heart_rate}</div><div className={v.spo2<95 ? 'text-red-600 font-bold' : ''}>{v.spo2}%</div><div>{v.temperature}C</div><div>{v.systolic}/{v.diastolic}</div></div>))}</div></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <header className="border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Logo /><span className="text-sm font-semibold">AstroMed AI</span><span className="hidden md:inline-flex ml-2 text-xs text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">LIVE</span></div>
          <nav className="flex gap-1 text-sm">
            <button onClick={() => setTab('overview')} className={tab === 'overview' ? 'px-4 py-2 rounded-lg bg-zinc-900 text-white' : 'px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-50'}>Overview</button>
            <button onClick={() => setTab('astronauts')} className={tab === 'astronauts' ? 'px-4 py-2 rounded-lg bg-zinc-900 text-white' : 'px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-50'}>Crew</button>
            <button onClick={() => setTab('systems')} className={tab === 'systems' ? 'px-4 py-2 rounded-lg bg-zinc-900 text-white' : 'px-4 py-2 rounded-lg text-zinc-500 hover:bg-zinc-50'}>Systems</button>
          </nav>
        </div>
      </header>
      {alerts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
          <div className="space-y-2">
            {alerts.map((alert: any) => (
              <div key={alert.id} className={alert.type === 'critical' ? 'border rounded-xl p-3 flex justify-between items-center text-sm border-red-200 bg-red-50 text-red-700' : 'border rounded-xl p-3 flex justify-between items-center text-sm border-amber-200 bg-amber-50 text-amber-700'}>
                <span className="font-medium">{alert.message}</span><span className="text-xs opacity-70">{new Date(alert.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {tab === 'overview' && (
          <>
            <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between gap-3"><div><h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mission Health Overview</h1><p className="text-sm text-zinc-500 mt-2">Live telemetry - Artemis III, ISS 72, Lunar Gateway</p></div><div className="flex gap-2"><button onClick={exportCSV} className="text-sm px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50">Export CSV</button><button onClick={() => window.print()} className="text-sm px-4 py-2 rounded-lg bg-zinc-900 text-white">Export PDF</button></div></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="border border-zinc-200 rounded-xl p-4 md:p-5"><div className="text-xs uppercase text-zinc-400">Active Crew</div><div className="text-2xl font-semibold mt-2">{astronauts.length}</div><div className="text-xs text-zinc-500 mt-1">{astronauts.filter(a=>a.status==='Active').length} active</div></div>
              <div className="border border-zinc-200 rounded-xl p-4 md:p-5"><div className="text-xs uppercase text-zinc-400">Heart Rate</div><div className="text-2xl font-semibold mt-2">{latestVital ? latestVital.heart_rate : '-'} bpm</div><div className="text-xs text-zinc-500 mt-1 truncate">{latestVital ? new Date(latestVital.created_at).toLocaleTimeString() : ''}</div></div>
              <div className="border border-zinc-200 rounded-xl p-4 md:p-5"><div className="text-xs uppercase text-zinc-400">Systems</div><div className="text-2xl font-semibold mt-2">{systems.filter(s=>s.status==='Operational').length}/{systems.length}</div><div className="text-xs text-zinc-500 mt-1">{systems.filter(s=>s.status==='Monitoring').length} monitoring</div></div>
              <div className="border border-zinc-200 rounded-xl p-4 md:p-5"><div className="text-xs uppercase text-zinc-400">Database</div><div className="text-2xl font-semibold mt-2 flex items-center gap-2">Live <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span></div><div className="text-xs text-zinc-500 mt-1">{vitals.length} records</div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-zinc-200 rounded-2xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6"><h3 className="text-sm font-semibold">Heart Rate - {selectedAstro ? selectedAstro.name : 'Select'}</h3><div className="flex gap-2 overflow-x-auto"><div className="flex gap-2">{astronauts.map((a: any) => (<button key={a.id} onClick={()=>setSelectedAstronaut(a.id)} className={selectedAstronaut===a.id ? 'whitespace-nowrap text-xs px-3 py-1 rounded-full bg-zinc-900 text-white' : 'whitespace-nowrap text-xs px-3 py-1 rounded-full border border-zinc-200 text-zinc-500'}>{a.name.split(' ').pop()}</button>))}</div></div></div>
                <div className="h-56 w-full"><MiniChart data={filteredVitals} dataKey="heart_rate" color="#18181b" domain={[60, 115]} /></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100"><div><div className="text-xs text-zinc-400 uppercase">SpO2</div><div className="text-sm font-medium mt-1">{latestVital ? latestVital.spo2 : '-'}%</div></div><div><div className="text-xs text-zinc-400 uppercase">Temp</div><div className="text-sm font-medium mt-1">{latestVital ? latestVital.temperature : '-'}C</div></div><div><div className="text-xs text-zinc-400 uppercase">BP</div><div className="text-sm font-medium mt-1">{latestVital ? latestVital.systolic + "/" + latestVital.diastolic : '-'}</div></div><div><div className="text-xs text-zinc-400 uppercase">AI Risk</div><div className={aiResult && aiResult.risk_score >= 70 ? 'text-sm font-bold mt-1 text-red-600' : 'text-sm font-medium mt-1'}>{aiResult ? aiResult.risk_score + '% ' + aiResult.risk_status : 'Loading...'}</div></div></div>
              </div>
              <div className="border border-zinc-200 rounded-2xl p-4 md:p-6"><h3 className="text-sm font-semibold mb-4">Systems Status</h3><div className="space-y-3">{systems.map((s: any) => (<div key={s.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0"><div><div className="text-sm font-medium">{s.system_name}</div><div className="text-xs text-zinc-500">{s.value} {s.unit}</div></div><span className={s.status==='Operational' ? 'text-xs px-2 py-1 rounded-full border border-zinc-900' : 'text-xs px-2 py-1 rounded-full border border-amber-300 text-amber-700'}>{s.status}</span></div>))}</div></div>
            </div>
          </>
        )}
        {tab === 'astronauts' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6"><h1 className="text-xl md:text-2xl font-semibold">Crew Roster - Tap for Details</h1><input value={search} onChange={(e: any)=>setSearch(e.target.value)} placeholder="Search name, mission, role..." className="text-sm border border-zinc-200 rounded-lg px-3 py-2 w-full sm:w-72 outline-none focus:border-zinc-900" /></div>
            <div className="grid gap-3 md:gap-4">{filteredAstronauts.map((a: any) => { const v = vitals.filter((x: any)=>x.astronaut_id===a.id).slice(-1)[0] as any; return (<button key={a.id} onClick={()=>setDetailId(a.id)} className="text-left border border-zinc-200 rounded-xl p-4 md:p-6 hover:border-zinc-900 transition group"><div className="flex justify-between items-start"><div className="min-w-0 flex-1"><div className="text-sm font-medium group-hover:underline">{a.name}</div><div className="text-xs text-zinc-500 mt-1">{a.role} - {a.mission}</div></div><span className="text-xs px-2 py-1 rounded-full border border-zinc-200 ml-2">{a.status}</span></div><div className="text-xs mt-4 flex flex-wrap gap-3 text-zinc-600 bg-zinc-50 rounded-lg p-3"><span>HR: {v ? v.heart_rate : '-'} bpm</span><span>SpO2: {v ? v.spo2 : '-'}%</span><span>Temp: {v ? v.temperature : '-'}C</span><span className="ml-auto text-zinc-400 group-hover:text-zinc-900">View</span></div></button>)})}{filteredAstronauts.length===0 && <div className="text-sm text-zinc-500 text-center py-10">No crew found</div>}</div>
          </>
        )}
        {tab === 'systems' && (
          <>
            <h1 className="text-xl font-semibold mb-6">Systems</h1>
            <div className="border border-zinc-200 rounded-xl overflow-hidden"><div className="hidden md:grid grid-cols-4 text-xs uppercase text-zinc-400 p-4 border-b bg-zinc-50"><div>System</div><div>Status</div><div>Value</div><div>Unit</div></div>{systems.map((s: any)=>(<div key={s.id} className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm p-4 border-b last:border-0"><div className="font-medium col-span-2 md:col-span-1">{s.system_name}</div><div>{s.status}</div><div>{s.value}</div><div className="text-zinc-500">{s.unit || '-'}</div></div>))}</div>
          </>
        )}
      </main>
    </div>
  )
}