import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

  useEffect(() => {
    const fetchAll = async () => {
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
  }, [])

  const filteredVitals = vitals.filter(v => v.astronaut_id === selectedAstronaut)
  const latestVital = filteredVitals[filteredVitals.length - 1]
  const selectedAstro = astronauts.find(a => a.id === selectedAstronaut)

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-[Inter] antialiased">
      <header className="border-b border-zinc-200 sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text- font-semibold tracking-tight">AstroMed AI</span>
            <span className="ml-4 text- text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">PRODUCTION</span>
          </div>
          <nav className="flex gap-1 text-">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'astronauts', label: 'Astronauts' },
              { id: 'systems', label: 'Systems' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`px-4 py-2 rounded- transition ${tab === item.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        {tab === 'overview' && (
          <>
            <div className="mb-10">
              <h1 className="text- font-[700] tracking-[-0.02em]">Mission Health Overview</h1>
              <p className="text- text-zinc-500 mt-2">Live telemetry from Artemis III, ISS Expedition 72, Lunar Gateway</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="border border-zinc-200 rounded- p-5">
                <div className="text- uppercase tracking-widest text-zinc-400">Active Astronauts</div>
                <div className="text- font-semibold mt-2">{astronauts.length}</div>
                <div className="text- text-zinc-500 mt-1">{astronauts.filter(a=>a.status==='Active').length} active, {astronauts.filter(a=>a.status==='Monitoring').length} monitoring</div>
              </div>
              <div className="border border-zinc-200 rounded- p-5">
                <div className="text- uppercase tracking-widest text-zinc-400">Avg Heart Rate</div>
                <div className="text- font-semibold mt-2">{latestVital ? `${latestVital.heart_rate} bpm` : '—'}</div>
                <div className="text- text-zinc-500 mt-1">Last reading {latestVital ? new Date(latestVital.created_at).toLocaleTimeString() : ''}</div>
              </div>
              <div className="border border-zinc-200 rounded- p-5">
                <div className="text- uppercase tracking-widest text-zinc-400">Systems Operational</div>
                <div className="text- font-semibold mt-2">{systems.filter(s=>s.status==='Operational').length}/{systems.length}</div>
                <div className="text- text-zinc-500 mt-1">{systems.filter(s=>s.status==='Monitoring').length} monitoring</div>
              </div>
              <div className="border border-zinc-200 rounded- p-5">
                <div className="text- uppercase tracking-widest text-zinc-400">Database</div>
                <div className="text- font-semibold mt-2">Live</div>
                <div className="text- text-zinc-500 mt-1">{vitals.length} vitals records</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 border border-zinc-200 rounded- p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text- font-semibold">Heart Rate — {selectedAstro?.name || 'Select astronaut'}</h3>
                  <div className="flex gap-2">
                    {astronauts.map(a => (
                      <button key={a.id} onClick={()=>setSelectedAstronaut(a.id)} className={`text- px-3 py-1 rounded-full border transition ${selectedAstronaut===a.id ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-500'}`}>{a.name.split(' ')[1]}</button>
                    ))}
                  </div>
                </div>
                <div className="h-">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredVitals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis dataKey="id" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" domain={[60, 85]} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }} />
                      <Line type="monotone" dataKey="heart_rate" stroke="#18181b" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100">
                  <div><div className="text- text-zinc-400">SpO2</div><div className="text- font-medium mt-1">{latestVital?.spo2}%</div></div>
                  <div><div className="text- text-zinc-400">Temp</div><div className="text- font-medium mt-1">{latestVital?.temperature}°C</div></div>
                  <div><div className="text- text-zinc-400">BP</div><div className="text- font-medium mt-1">{latestVital?.systolic}/{latestVital?.diastolic}</div></div>
                  <div><div className="text- text-zinc-400">Status</div><div className="text- font-medium mt-1">{selectedAstro?.status}</div></div>
                </div>
              </div>

              <div className="border border-zinc-200 rounded- p-6">
                <h3 className="text- font-semibold mb-6">Systems Status</h3>
                <div className="space-y-4">
                  {systems.map(s => (
                    <div key={s.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                      <div>
                        <div className="text- font-medium">{s.system_name}</div>
                        <div className="text- text-zinc-500">{s.value} {s.unit}</div>
                      </div>
                      <span className={`text- px-2 py-1 rounded-full border ${s.status==='Operational' ? 'border-zinc-900 text-zinc-900' : 'border-amber-300 text-amber-700'}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'astronauts' && (
          <>
            <h1 className="text- font-semibold mb-8">Astronaut Roster</h1>
            <div className="grid gap-4">
              {astronauts.map(a => {
                const v = vitals.filter(x=>x.astronaut_id===a.id).slice(-1)[0]
                return (
                  <div key={a.id} className="border border-zinc-200 rounded- p-6 flex justify-between">
                    <div>
                      <div className="text- font-medium">{a.name}</div>
                      <div className="text- text-zinc-500 mt-1">{a.role} — {a.mission}</div>
                      <div className="text- mt-3 flex gap-4">
                        <span>HR: {v?.heart_rate || '—'} bpm</span>
                        <span>SpO2: {v?.spo2 || '—'}%</span>
                        <span>Temp: {v?.temperature || '—'}°C</span>
                      </div>
                    </div>
                    <span className="text- h-fit px-3 py-1 rounded-full border border-zinc-200">{a.status}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'systems' && (
          <>
            <h1 className="text- font-semibold mb-8">Systems Monitoring</h1>
            <div className="border border-zinc-200 rounded- overflow-hidden">
              <div className="grid grid-cols-4 text- uppercase tracking-widest text-zinc-400 p-4 border-b border-zinc-200 bg-zinc-50">
                <div>System</div><div>Status</div><div>Value</div><div>Unit</div>
              </div>
              {systems.map(s=>(
                <div key={s.id} className="grid grid-cols-4 text- p-4 border-b border-zinc-100 last:border-0">
                  <div className="font-medium">{s.system_name}</div>
                  <div>{s.status}</div>
                  <div>{s.value}</div>
                  <div className="text-zinc-500">{s.unit || '—'}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}