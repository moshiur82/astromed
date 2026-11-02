
import { useState, useEffect } from 'react';

type Task = { id: string; title: string; desc: string; points: number; done: boolean; type: 'vital' | 'exercise' | 'sleep' | 'mood'; time: string };

const defaultTasks: Task[] = [
  { id: '1', title: 'Morning Vitals Check', desc: 'Measure HR, SpO2, BP, Temp before breakfast', points: 20, done: true, type: 'vital', time: '07:00 UTC' },
  { id: '2', title: 'Blood Sugar Log', desc: 'Fasting sugar 70-100 mg/dL - Log after meal', points: 15, done: false, type: 'vital', time: '08:30 UTC' },
  { id: '3', title: 'Sleep Review', desc: 'Log last night sleep hours - Target 7-8h', points: 15, done: true, type: 'sleep', time: '07:15 UTC' },
  { id: '4', title: 'Mood Check-in', desc: 'Rate mood: Calm, Focused, Stressed? NASA behavioral health', points: 10, done: false, type: 'mood', time: '12:00 UTC' },
  { id: '5', title: 'Cardio Exercise', desc: '20min bungee treadmill - Counter cardiovascular deconditioning', points: 25, done: false, type: 'exercise', time: '16:00 UTC' },
];

export default function GamificationBoard() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [streak, setStreak] = useState(3);
  const [showConfetti, setShowConfetti] = useState<string | null>(null);

  const doneCount = tasks.filter(t=>t.done).length;
  const totalPoints = tasks.filter(t=>t.done).reduce((s,t)=>s+t.points,0);
  const healthScore = Math.min(100, 55 + totalPoints + streak*2 + doneCount*3);
  const completion = Math.round((doneCount / tasks.length)*100);

  useEffect(() => {
    const saved = localStorage.getItem('astromed-tasks');
    if(saved){ try{ setTasks(JSON.parse(saved)); }catch{} }
    const s = localStorage.getItem('astromed-streak');
    if(s) setStreak(Number(s));
  }, []);
  useEffect(() => {
    localStorage.setItem('astromed-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => {
      if(t.id===id && !t.done){
        setShowConfetti(id);
        setTimeout(()=>setShowConfetti(null), 1000);
        return {...t, done: true};
      }
      return t.id===id ? {...t, done: !t.done} : t;
    }));
  };

  const completeAll = () => {
    setTasks(prev => prev.map(t => ({...t, done: true})));
    setStreak(s=>s+1);
    localStorage.setItem('astromed-streak', String(streak+1));
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Score Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-zinc-900 text-white rounded-[16px] p-4 border border-zinc-800">
          <div className="text-[10px] tracking-[0.08em] text-zinc-400">HEALTH SCORE</div>
          <div className="flex items-baseline gap-2 mt-2">
            <div className="text-[28px] font-bold tracking-tight">{healthScore}%</div>
            <div className={`text-[11px] px-2 py-0.5 rounded-full ${healthScore>=80 ? 'bg-green-500/20 text-green-300' : healthScore>=60 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>{healthScore>=80 ? 'Excellent' : healthScore>=60 ? 'Good' : 'Attention'}</div>
          </div>
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all" style={{width: healthScore+'%'}}></div>
          </div>
          <div className="text-[10px] text-zinc-500 mt-2">Based on tasks, vitals, sleep</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[16px] p-4">
          <div className="text-[10px] tracking-[0.08em] text-zinc-500">DAILY STREAK</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-[28px]">🔥</div>
            <div className="text-[24px] font-bold">{streak}</div>
            <div className="text-[12px] text-zinc-500">days</div>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Keep checking daily!</div>
          <div className="mt-3 flex gap-1">
            {Array.from({length:7}).map((_,i)=>(
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < streak ? 'bg-zinc-900' : 'bg-zinc-100'}`}></div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[16px] p-4">
          <div className="text-[10px] tracking-[0.08em] text-zinc-500">BADGES EARNED</div>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[12px]">♥</div>
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[12px]">◐</div>
            <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-[12px] text-zinc-400">⬢</div>
            <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-[12px] text-zinc-400">◑</div>
            <div className="text-[11px] text-zinc-500 ml-1">{doneCount}/5 today</div>
          </div>
          <div className="text-[11px] text-zinc-500 mt-3">{totalPoints} points earned today</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[16px] p-4">
          <div className="text-[10px] tracking-[0.08em] text-zinc-500">COMPLETION</div>
          <div className="text-[24px] font-bold mt-2">{completion}%</div>
          <div className="text-[11px] text-zinc-500">{doneCount} of {tasks.length} tasks</div>
          <button onClick={completeAll} className="mt-3 w-full text-[11px] px-3 py-2 rounded-full bg-zinc-900 text-white hover:bg-black transition">Complete all + 🔥 streak</button>
        </div>
      </div>

      {/* Daily Tasks - Prompt astronauts to take measurements */}
      <div className="bg-white border border-zinc-200 rounded-[20px] overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold">Today's Health Routine - Prompted Measurements</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">NASA HRP recommends daily checks - Tap to complete, earn points</p>
          </div>
          <div className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Brief Requirement: Prompt to measure</div>
        </div>

        <div className="p-3 grid gap-2">
          {tasks.map(t => (
            <div key={t.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${t.done ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200 hover:border-zinc-900 hover:shadow-sm'} ${showConfetti===t.id ? 'animate-pulse' : ''}`} onClick={()=>toggle(t.id)}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] shrink-0 ${t.done ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-500 group-hover:border-zinc-900'}`}>
                {t.done ? '✓' : t.type==='vital' ? '♥' : t.type==='sleep' ? '☾' : t.type==='mood' ? '◑' : '↗'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-medium flex items-center gap-2 ${t.done ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                  {t.title}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.type==='vital' ? 'bg-red-50 text-red-600 border border-red-100' : t.type==='sleep' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : t.type==='mood' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-zinc-100 text-zinc-600'}`}>{t.type}</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{t.desc} • {t.time} • +{t.points} pts</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-[10px] px-2 py-1 rounded-full ${t.done ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>{t.done ? 'Done' : 'Tap to do'}</div>
                {showConfetti===t.id && <div className="text-[12px] mt-1">+{t.points} 🎉</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500">
          <span>NASA Reference: HRP 5 Hazards - Daily monitoring prevents critical events • Data saved locally for offline space use</span>
          <span className="hidden md:inline">Tip: Complete daily to keep Health Score high</span>
        </div>
      </div>
    </div>
  );
}
