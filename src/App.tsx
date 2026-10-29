import Logo from './components/Logo'

function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top Header - Apple Style */}
      <header className="border-b border-[#E5E7EB]">
        <div className="max-w- mx-auto px-8 h- flex items-center justify-between">
          <Logo />
          <div className="flex gap-6 text- tracking-wide text-[#6B7280]">
            <span>MISSION</span>
            <span className="text-black">PROFILE</span>
          </div>
        </div>
      </header>

      {/* Text Navigation - No Icons */}
      <nav className="border-b border-[#E5E7EB]">
        <div className="max-w- mx-auto px-8 h- flex items-center gap-8 text-">
          <span className="text-black border-b border-black pb-">Overview</span>
          <span className="text-[#6B7280]">Astronauts</span>
          <span className="text-[#6B7280]">Missions</span>
          <span className="text-[#6B7280]">Health</span>
          <span className="text-[#6B7280]">Research</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w- mx-auto px-8 py-16">
        {/* Hero */}
        <div className="mb-20">
          <h1 className="text- font-[600] tracking-[-0.02em] leading-[1.1]">ASTROMED AI</h1>
          <p className="text- text-[#6B7280] mt-2 font-[400]">Astronaut Health Intelligence</p>
          <div className="mt-6 text- leading-[1.6] text-[#111111] max-w-">
            <p>Continuous monitoring.</p>
            <p>Clear insights.</p>
          </div>
        </div>

        {/* Cards - No Shadow, No Gradient */}
        <div className="grid grid-cols-3 border border-[#E5E7EB]">
          <div className="p-8 border-r border-[#E5E7EB]">
            <div className="text- tracking-[0.08em] text-[#6B7280] uppercase">Cardiovascular</div>
            <div className="text- font-[500] mt-4">72 bpm</div>
            <div className="text- text-[#6B7280] mt-1">Heart rate</div>
          </div>
          <div className="p-8 border-r border-[#E5E7EB]">
            <div className="text- tracking-[0.08em] text-[#6B7280] uppercase">Respiratory</div>
            <div className="text- font-[500] mt-4">98%</div>
            <div className="text- text-[#6B7280] mt-1">Oxygen saturation</div>
          </div>
          <div className="p-8">
            <div className="text- tracking-[0.08em] text-[#6B7280] uppercase">Sleep</div>
            <div className="text- font-[500] mt-4">7h 24m</div>
            <div className="text- text-[#6B7280] mt-1">Sleep duration</div>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="mt-12 border border-[#E5E7EB] p-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="text- tracking-[0.08em] text-[#6B7280] uppercase">System Status</div>
              <div className="text- mt-3">Frontend: <span className="text-black font-[500]">Live</span></div>
              <div className="text- mt-1 text-[#6B7280]">Backend: Pending | Database: Pending</div>
            </div>
            <div className="text- border border-[#E5E7EB] px-3 py-1">HELLO WORLD READY</div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App