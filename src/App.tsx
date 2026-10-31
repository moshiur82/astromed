import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Logo from './components/Logo'

type HelloRow = {
  id: number
  message: string
  created_at: string
}

type ApiStatus = {
  status: string
  message: string
  database: string
  count: number
  timestamp: string
}

export default function App() {
  const [message, setMessage] = useState('Hello World from AstroMed AI')
  const [rows, setRows] = useState<HelloRow[]>([])
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiLoading, setApiLoading] = useState(true)

  const fetchData = async () => {
    const { data } = await supabase
      .from('hello_world')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setRows(data)
  }

  const fetchApiStatus = async () => {
    try {
      const res = await fetch('/api/hello')
      const json = await res.json()
      setApiStatus(json)
    } catch {
      setApiStatus(null)
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchApiStatus()
  }, [])

  const handlePost = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('hello_world')
      .insert([{ message }])
    
    if (!error) {
      await fetchData()
      await fetchApiStatus()
      setMessage('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-[Inter] antialiased">
      <header className="border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text- font-semibold tracking-tight">AstroMed AI</span>
          </div>
          <nav className="flex gap-6 text- text-zinc-500">
            <span className="text-zinc-900">Overview</span>
            <span>Systems</span>
            <span>Research</span>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text- font-[700] tracking-[-0.03em] leading-[1.1]">AstroMed AI</h1>
          <p className="mt-4 text- text-zinc-500 max-w- leading-6">
            Space health monitoring platform. Frontend + Backend API + Database live on free tier.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-zinc-200 rounded- p-5">
            <div className="text- uppercase tracking-widest text-zinc-400 mb-2">Frontend</div>
            <div className="text- font-medium">Live on Vercel</div>
            <div className="text- text-zinc-500 mt-1">astromed-rho.vercel.app</div>
          </div>
          <div className="border border-zinc-200 rounded- p-5">
            <div className="text- uppercase tracking-widest text-zinc-400 mb-2">Backend API</div>
            <div className="text- font-medium">{apiLoading ? 'Checking...' : apiStatus ? apiStatus.status : 'offline'}</div>
            <div className="text- text-zinc-500 mt-1">/api/hello — {apiStatus?.database || 'connecting'}</div>
          </div>
          <div className="border border-zinc-200 rounded- p-5">
            <div className="text- uppercase tracking-widest text-zinc-400 mb-2">Database</div>
            <div className="text- font-medium">Supabase Postgres</div>
            <div className="text- text-zinc-500 mt-1">{apiStatus ? `${apiStatus.count} records` : `${rows.length} records`}</div>
          </div>
        </div>

        <div className="border border-zinc-200 rounded- p-8 mb-8">
          <h2 className="text- font-semibold mb-6">Hello World — Live Database Test</h2>
          <div className="flex gap-3 mb-8">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 border border-zinc-200 rounded- px-4 py-3 text- outline-none focus:border-zinc-900 transition"
            />
            <button
              onClick={handlePost}
              disabled={loading || !message.trim()}
              className="bg-zinc-900 text-white text- font-medium px-6 py-3 rounded- hover:bg-black disabled:opacity-40 transition"
            >
              {loading ? 'Saving...' : 'POST to DB'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="text- uppercase tracking-widest text-zinc-400">Live Records from Supabase</div>
            {rows.length === 0 ? (
              <div className="text- text-zinc-500 py-4">No records yet. POST your first message.</div>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="flex justify-between items-center border-b border-zinc-100 py-3 last:border-0">
                  <span className="text-">{row.message}</span>
                  <span className="text- text-zinc-400">{new Date(row.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border border-zinc-200 rounded- p-5">
          <div className="text- uppercase tracking-widest text-zinc-400 mb-3">System Status</div>
          <div className="grid grid-cols-2 gap-4 text-">
            <div className="flex justify-between"><span className="text-zinc-500">Frontend</span><span className="font-medium">Operational</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Backend API</span><span className="font-medium">{apiStatus ? 'Operational' : 'Checking'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Database</span><span className="font-medium">Connected</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Last Sync</span><span className="font-medium">{apiStatus ? new Date(apiStatus.timestamp).toLocaleTimeString() : '—'}</span></div>
          </div>
        </div>
      </main>
    </div>
  )
}