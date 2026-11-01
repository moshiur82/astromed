// File: src/App.tsx - Full Version with Alerts + Export + Search
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Logo from './components/Logo'

type Astronaut = { id: number; name: string; mission: string; role: string; status: string }
type Vital = { id: number; astronaut_id: number; heart_rate: number; spo2: number; temperature: number; systolic: number; diastolic: number; created_at: string }
type System = { id: number; system_name: string; status: string; value: string; unit: string }



export default function App() {
  const [tab, setTab] = useState<'overview' | 'astronauts' | 'systems'>('overview')
  const [astronauts, setAstronauts] = useState<Astronaut[]>([])
  const [vitals, setVitals] = useState<Vital[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [selectedAstronaut, setSelectedAstronaut] = useState<number>(1)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchAll = async () => {function MiniChart({ data, dataKey, color, domain }: { data: any[], dataKey: string, color: string, domain: [number, number] }) {
  if (!data || data.length < 2) {
    return <div className="h-full flex items-center justify-center text- text-zinc-400">Need 2+ readings - Live adding every 5s</div>
  }
  const width = 300
  const height = 120
  const padding = 20
  const values = data.map((d: any) => d[dataKey])
  const min = domain[0]
  const max = domain[1]
  const range = max - min || 1
  const vb = "0 0 " + width + " " + height
  const points = values.map((v: number, i: number) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2)
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return x + "," + y
  }).join(" ")
  return[STRIPPED 35 bytes]"w-full h-full">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={points}></polyline>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#f4f4f5" strokeWidth="1"></line>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f4f4f5" strokeWidth="1"></line>
    </svg>
  )
}
      const [a, v, s] = await Promise.all([
        supabase.from('astronauts').select('*').order('id'),
        supabase.from('vital_signs').select('*').order('created_at'),
        supabase.from('systems_status').select('*').order('id')
      ])
      if (a.data) setAstronauts(a.data)
      if (v.data) setVitals(v.data)
      if (s.data) setSystems(s.data)
    }
    fetchAll()
    const channel = supabase.channel('vitals-live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vital_signs' }, (payload) => {
      setVitals(prev => [...prev, payload.new as Vital].slice(-100))
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (!isLive || astronauts.length === 0) return
    const id = window.setInterval(async () => {
      const astroId = astronauts[Math.floor(Math.random() * astronauts.length)].id
      const isAnomaly = Math.random() < 0.15 // 15% chance anomaly for Alerts demo
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

  const alerts = vitals.slice(-15).flatMap(v => {
    const a = astronauts.find(x => x.id === v.astronaut_id)
    const list: any[] = []
    if (v.heart_rate > 100) list.push({ id: `${v.id}-hr-high`, type: 'critical', message: `High HR ${v.heart_rate} bpm — ${a?.name || 'Crew'}`, time: v.created_at })
    if (v.heart_rate < 60) list.push({ id: `${v.id}-hr-low`, type: 'warning', message: `Low HR ${v.heart_rate} bpm — ${a?.name || 'Crew'}`, time: v.created_at })
    if (v.spo2 < 95) list.push({ id: `${v.id}-spo2`, type: 'critical', message: `Low SpO2 ${v.spo2}% — ${a?.name || 'Crew'}`, time: v.created_at })
    if (v.temperature > 37.5) list.push({ id: `${v.id}-temp`, type: 'warning', message: `High Temp ${v.temperature}°C — ${a?.name || 'Crew'}`, time: v.created_at })
    return list
  }).slice(-5).reverse()

  const exportCSV = () => {
    const headers = ['Time','Astronaut','Heart Rate','SpO2','Temp','BP']
    const rows = vitals.slice(-50).map(v => {
      const a = astronauts.find(x => x.id === v.astronaut_id)
      return [new Date(v.created_at).toLocaleString(), a?.name || v.astronaut_id, v.heart_rate, v.spo2, v.temperature, `${v.systolic}/${v.diastolic}`].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `astromed-vitals-${Date.now()}.csv`; a.click()
  }

  const filteredAstronauts = astronauts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.mission.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))

  const filteredVitals = vitals.filter(v => v.astronaut_id === selectedAstronaut).slice(-20)
  const latestVital = filteredVitals[filteredVitals.length - 1]
  const selectedAstro = astronauts.find(a => a.id === selectedAstronaut)
  const detailAstro = astronauts.find(a => a.id === detailId)
  const detailVitals = vitals.filter(v => v.astronaut_id === detailId).slice(-30)

  if (detailId && detailAstro) {
    const latest = detailVitals[detailVitals.length - 1]
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-[Inter] antialiased">
        <header className="border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <button onClick={()=>setDetailId(null)} className="text- px-3 py-2 rounded- border border-zinc-200 hover:bg-zinc-50">← Back to Crew</button>
            <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></span><span className="text- text-zinc-500">{isLive ? 'LIVE' : 'PAUSED'}</span></div>
          </div>
        </header>
        {alerts.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className={`border rounded- p-3 flex justify-between items-center text- ${alert.type==='critical' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  <span className="font-medium">⚠ {alert.message}</span>
                  <span className="text- opacity-70">{new Date(alert.time).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-8"><h1 className="text- md:text- font-bold tracking-tight">{detailAstro.name}</h1><p className="text- text-zinc-500 mt-2">{detailAstro.role} • {detailAstro.mission} • {detailAstro.status}</p></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <div className="border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-400">Heart Rate</div><div className="text- font-semibold mt-1">{latest?.heart_rate || '—'} <span className="text- font-normal">bpm</span></div><div className="text- text-zinc-500 mt-1">Normal 60-100</div></div>
            <div className="border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-400">SpO2</div><div className="text- font-semibold mt-1">{latest?.spo2 || '—'}%</div><div className="text- text-zinc-500 mt-1">Normal 95-100%</div></div>
            <div className="border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-400">Temperature</div><div className="text- font-semibold mt-1">{latest?.temperature || '—'}°C</div><div className="text- text-zinc-500 mt-1">Normal 36.1-37.2</div></div>
            <div className="border border-zinc-200 rounded- p-4"><div className="text- uppercase text-zinc-400">Blood Pressure</div><div className="text- font-semibold mt-1">{latest ? `${latest.systolic}/${latest.diastolic}` : '—'}</div><div className="text- text-zinc-500 mt-1">Normal 120/80</div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { key: 'heart_rate', label: 'Heart Rate (bpm)', color: '#18181b', domain: [60, 115] as [number, number] },
              { key: 'spo2', label: 'SpO2 (%)', color: '#18181b', domain: [90, 100] as [number, number] },
              { key: 'temperature', label: 'Temperature (°C)', color: '#18181b', domain: [36, 39] as [number, number] },
              { key: 'systolic', label: 'Systolic BP', color: '#52525b', domain: [110, 135] as [number, number] }
            ].map(chart => (
              <div key={chart.key} className="border border-zinc-200 rounded- p-4 md:p-6">
                <h3 className="text- font-semibold mb-4">{chart.label} — Last: {(detailVitals[detailVitals.length-1] as any)?.[chart.key] || '—'}</h3>
                <div className="h- w-full bg-white"><MiniChart data={detailVitals} dataKey={chart.key} color={chart.color} domain={chart.domain} /></div>
                <div className="flex justify-between text- text-zinc-400 mt-2"><span>{chart.domain[0]}</span><span>{chart.domain[1]}</span></div>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-zinc-200 rounded- p-4 md:p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="text- font-semibold">Recent Readings ({detailVitals.length})</h3><button onClick={exportCSV} className="text- px-3 py-1.5 rounded- border border-zinc-200 hover:bg-zinc-50">Export CSV</button></div>
            <div className="overflow-x-auto"><div className="min-w-"><div className="grid grid-cols-5 text- uppercase text-zinc-400 p-2 border-b"><div>Time</div><div>HR</div><div>SpO2</div><div>Temp</div><div>BP</div></div>{detailVitals.slice(-10).reverse().map(v=>(<div key={v.id} className="grid grid-cols-5 text- p-2 border-b last:border-0"><div className="text-zinc-500">{new Date(v.created_at).toLocaleTimeString()}</div><div className={v.heart_rate>100 ? 'text-red-600 font-bold' : ''}>{v.heart_rate}</div><div className={v.spo2<95 ? 'text-red-600 font-bold' : ''}>{v.spo2}%</div><div>{v.temperature}°C</div><div>{v.systolic}/{v.diastolic}</div></div>))}</div></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-[Inter] antialiased">
      <header className="border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Logo /><span className="text- font-semibold">AstroMed AI</span><span className="hidden md:inline-flex ml-2 text- text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">LIVE</span></div><div className="flex items-center gap-2 md:hidden"><span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></span><span className="text- text-zinc-500">{isLive ? 'LIVE' : 'PAUSED'}</span></div></div>
          <div className="flex items-center justify-between md:justify-end gap-3"><nav className="flex gap-1 text- md:text-">{[{ id: 'overview', label: 'Overview' },{ id: 'astronauts', label: 'Crew' },{ id: 'systems', label: 'Systems' }].map(item => (<button key={item.id} onClick={() => setTab(item.id as any)} className={`px-3 md:px-4 py-2 rounded- transition ${tab === item.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>{item.label}</button>))}</nav><button onClick={() => setIsLive(!isLive)} className={`hidden md:flex items-center gap-2 text- px-3 py-2 rounded- border ${isLive ? 'border-green-200 bg-green-50 text-green-700' : 'border-zinc-200 text-zinc-500'}`}><span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></span>{isLive ? 'Live' : 'Paused'}</button></div>
        </div>
      </header>
      {alerts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`border rounded- p-3 flex justify-between items-center text- ${alert.type==='critical' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                <span className="font-medium">⚠ {alert.message}</span>
                <span className="text- opacity-70">{new Date(alert.time).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {tab === 'overview' && (
          <>
            <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between gap-3"><div><h1 className="text- md:text- font-bold tracking-tight">Mission Health Overview</h1><p className="text- md:text- text-zinc-500 mt-2">Live telemetry • Artemis III, ISS 72, Lunar Gateway</p></div><div className="flex gap-2"><button onClick={exportCSV} className="text- px-4 py-2 rounded- border border-zinc-200 hover:bg-zinc-50">Export CSV</button><button onClick={()=>window.print()} className="text- px-4 py-2 rounded- bg-zinc-900 text-white">Export PDF</button></div></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="border border-zinc-200 rounded- p-4 md:p-5"><div className="text- uppercase text-zinc-400">Active Crew</div><div className="text- md:text- font-semibold mt-2">{astronauts.length}</div><div className="text- text-zinc-500 mt-1">{astronauts.filter(a=>a.status==='Active').length} active</div></div>
              <div className="border border-zinc-200 rounded- p-4 md:p-5"><div className="text- uppercase text-zinc-400">Heart Rate</div><div className="text- md:text- font-semibold mt-2">{latestVital ? `${latestVital.heart_rate}` : '—'} <span className="text- font-normal">bpm</span></div><div className="text- text-zinc-500 mt-1 truncate">{latestVital ? new Date(latestVital.created_at).toLocaleTimeString() : ''}</div></div>
              <div className="border border-zinc-200 rounded- p-4 md:p-5"><div className="text- uppercase text-zinc-400">Systems</div><div className="text- md:text- font-semibold mt-2">{systems.filter(s=>s.status==='Operational').length}/{systems.length}</div><div className="text- text-zinc-500 mt-1">{systems.filter(s=>s.status==='Monitoring').length} monitoring</div></div>
              <div className="border border-zinc-200 rounded- p-4 md:p-5"><div className="text- uppercase text-zinc-400">Database</div><div className="text- md:text- font-semibold mt-2 flex items-center gap-2">Live <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`}></span></div><div className="text- text-zinc-500 mt-1">{vitals.length} records</div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-zinc-200 rounded- p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4 md:mb-6"><h3 className="text- font-semibold">Heart Rate — {selectedAstro?.name || 'Select'}</h3><div className="flex gap-2 overflow-x-auto"><div className="flex gap-2">{astronauts.map(a => (<button key={a.id} onClick={()=>setSelectedAstronaut(a.id)} className={`whitespace-nowrap text- px-3 py-1 rounded-full border ${selectedAstronaut===a.id ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-500'}`}>{a.name.split(' ').pop()}</button>))}</div></div></div>
                <div className="h- w-full"><MiniChart data={filteredVitals} dataKey="heart_rate" color="#18181b" domain={[60, 115]} /></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100"><div><div className="text- text-zinc-400 uppercase">SpO2</div><div className="text- font-medium mt-1">{latestVital?.spo2 || '—'}%</div></div><div><div className="text- text-zinc-400 uppercase">Temp</div><div className="text- font-medium mt-1">{latestVital?.temperature || '—'}°C</div></div><div><div className="text- text-zinc-400 uppercase">BP</div><div className="text- font-medium mt-1">{latestVital ? `${latestVital.systolic}/${latestVital.diastolic}` : '—'}</div></div><div><div className="text- text-zinc-400 uppercase">Status</div><div className="text- font-medium mt-1">{selectedAstro?.status || '—'}</div></div></div>
              </div>
              <div className="border border-zinc-200 rounded- p-4 md:p-6"><h3 className="text- font-semibold mb-4">Systems Status</h3><div className="space-y-3">{systems.map(s => (<div key={s.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0"><div><div className="text- font-medium">{s.system_name}</div><div className="text- text-zinc-500">{s.value} {s.unit}</div></div><span className={`text- px-2 py-1 rounded-full border ${s.status==='Operational' ? 'border-zinc-900 text-zinc-900' : 'border-amber-300 text-amber-700'}`}>{s.status}</span></div>))}</div></div>
            </div>
          </>
        )}
        {tab === 'astronauts' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6"><h1 className="text- md:text- font-semibold">Crew Roster — Tap for Details</h1><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, mission, role..." className="text- border border-zinc-200 rounded- px-3 py-2 w-full sm:w- outline-none focus:border-zinc-900" /></div>
            <div className="grid gap-3 md:gap-4">{filteredAstronauts.map(a => { const v = vitals.filter(x=>x.astronaut_id===a.id).slice(-1)[0]; return (<button key={a.id} onClick={()=>setDetailId(a.id)} className="text-left border border-zinc-200 rounded- p-4 md:p-6 hover:border-zinc-900 transition group"><div className="flex justify-between items-start"><div className="min-w-0 flex-1"><div className="text- md:text- font-medium group-hover:underline">{a.name}</div><div className="text- text-zinc-500 mt-1">{a.role} • {a.mission}</div></div><span className="text- px-2 py-1 rounded-full border border-zinc-200 ml-2">{a.status}</span></div><div className="text- mt-4 flex flex-wrap gap-3 text-zinc-600 bg-zinc-50 rounded- p-3"><span>HR: {v?.heart_rate || '—'} bpm</span><span>SpO2: {v?.spo2 || '—'}%</span><span>Temp: {v?.temperature || '—'}°C</span><span className="hidden sm:inline">BP: {v ? `${v.systolic}/${v.diastolic}` : '—'}</span><span className="ml-auto text-zinc-400 group-hover:text-zinc-900">View →</span></div></button>)})}{filteredAstronauts.length===0 && <div className="text- text-zinc-500 text-center py-10">No crew found for "{search}"</div>}</div>
          </>
        )}
        {tab === 'systems' && (
          <>
            <h1 className="text- md:text- font-semibold mb-6">Systems</h1>
            <div className="border border-zinc-200 rounded- overflow-hidden"><div className="hidden md:grid grid-cols-4 text- uppercase text-zinc-400 p-4 border-b bg-zinc-50"><div>System</div><div>Status</div><div>Value</div><div>Unit</div></div>{systems.map(s=>(<div key={s.id} className="grid grid-cols-2 md:grid-cols-4 gap-2 text- p-4 border-b last:border-0"><div className="font-medium col-span-2 md:col-span-1">{s.system_name}</div><div>{s.status}</div><div>{s.value}</div><div className="text-zinc-500">{s.unit || '—'}</div></div>))}</div>
          </>
        )}
      </main>
    </div>
  )
}