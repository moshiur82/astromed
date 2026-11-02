
import { useState } from 'react';

type BodyPart = {
  id: string;
  label: string;
  vital: string;
  icon: string;
  normal: string;
  whySpace: string;
  instruction: string;
  hazard: string;
  color: string;
};

const bodyParts: BodyPart[] = [
  {
    id: 'heart',
    label: 'Heart - Cardiovascular',
    vital: 'HR: 60-100 bpm | BP: 120/80 mmHg',
    icon: '♥',
    normal: '60-100 bpm',
    whySpace: 'Microgravity causes cardiovascular deconditioning, fluid shift to upper body, heart becomes 10% smaller. Radiation increases arrhythmia risk.',
    instruction: 'If HR >100 bpm at rest for 10min: Rest, hydrate 250ml, check O2. If >110 + chest discomfort: Alert Flight Surgeon immediately. Do 2min LBNP exercise.',
    hazard: 'Gravity Fields + Space Radiation',
  },
  {
    id: 'lungs',
    label: 'Lungs - Respiratory',
    vital: 'SpO2: 95-100% | Resp: 12-20 rpm',
    icon: '◐',
    normal: '95-100%',
    whySpace: 'Closed environment, CO2 buildup (up to 0.7% on ISS), dust particles. Microgravity alters lung ventilation distribution.',
    instruction: 'If SpO2 <95%: Check O2 circulation system, increase ventilation, perform pursed-lip breathing. If <92% + confusion: Use emergency O2, call crew.',
    hazard: 'Hostile Closed Environment',
  },
  {
    id: 'brain',
    label: 'Brain - Mood & Sleep',
    vital: 'Sleep: 7-8h | Mood: Calm/Focused',
    icon: '◑',
    normal: '7-8h sleep',
    whySpace: 'Isolation, confinement, distance from Earth causes behavioral health issues, circadian disruption due to 90min orbit sunrise.',
    instruction: 'Track sleep daily. If <6h for 2 days: Use light therapy (blue light 30min), maintain schedule, talk to crew. Mood Stressed: 10min mindfulness, contact ground psych support.',
    hazard: 'Isolation & Confinement + Distance from Earth',
  },
  {
    id: 'temp',
    label: 'Body - Temperature & Immune',
    vital: 'Temp: 36.1-37.2 °C',
    icon: '◒',
    normal: '36.1-37.2 °C',
    whySpace: 'Immune system changes in space, T-cell reduction. Thermal control system failure can cause hyperthermia quickly.',
    instruction: 'If Temp >37.5°C: Check thermal system, hydrate, cool towel on neck. If >38.3°C + fatigue: Possible infection - Isolate, monitor, request Flight Surgeon consult, check WBC history.',
    hazard: 'Hostile Closed Environment + Space Radiation',
  },
  {
    id: 'blood',
    label: 'Blood - Sugar & Nutrition',
    vital: 'Blood Sugar: 70-100 mg/dL fasting',
    icon: '⬢',
    normal: '70-100 mg/dL',
    whySpace: 'Inadequate nutrition, altered metabolism in microgravity, muscle loss affects glucose uptake. Stress raises sugar.',
    instruction: 'If >140 mg/dL: Review food intake, avoid sugary packs, walk 10min in station (bungee treadmill). If <70 mg/dL + dizzy: Take fast glucose 15g, recheck after 15min, alert crew.',
    hazard: 'Distance from Earth + Isolation',
  },
];

export default function HumanBodyMap() {
  const [selected, setSelected] = useState<BodyPart>(bodyParts[0]);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-[20px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-zinc-900">Interactive Human System - Click to Explore</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">NASA HRP 5 Hazards - Why measurements matter in space</p>
        </div>
        <div className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 text-white tracking-wide">NASA-STD-3001</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0">
        {/* Left: Body SVG */}
        <div className="bg-zinc-50/70 p-6 flex flex-col items-center border-r border-zinc-100">
          <div className="text-[11px] text-zinc-500 mb-4 tracking-wide">CLICK A BODY PART ↓</div>
          <svg viewBox="0 0 200 340" className="w-[200px] h-[340px]">
            {/* Head */}
            <g 
              onClick={() => setSelected(bodyParts[2])}
              onMouseEnter={() => setHovered('brain')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <circle cx="100" cy="38" r="32" fill={hovered==='brain' || selected.id==='brain' ? '#09090b' : 'white'} stroke="#e4e4e7" strokeWidth="1.5" className="transition-all" />
              <text x="100" y="43" textAnchor="middle" fontSize="14" fill={hovered==='brain' || selected.id==='brain' ? 'white' : '#71717a'} className="pointer-events-none select-none">◑</text>
              <text x="100" y="82" textAnchor="middle" fontSize="9" fill="#71717a" className="pointer-events-none">Brain</text>
            </g>

            {/* Heart - Left Chest */}
            <g 
              onClick={() => setSelected(bodyParts[0])}
              onMouseEnter={() => setHovered('heart')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <ellipse cx="86" cy="112" rx="22" ry="20" fill={hovered==='heart' || selected.id==='heart' ? '#09090b' : 'white'} stroke="#e4e4e7" strokeWidth="1.5" className="transition-all" />
              <text x="86" y="117" textAnchor="middle" fontSize="14" fill={hovered==='heart' || selected.id==='heart' ? 'white' : '#71717a'} className="pointer-events-none">♥</text>
              <text x="46" y="115" textAnchor="middle" fontSize="8.5" fill="#52525b" className="pointer-events-none font-medium">Heart</text>
            </g>

            {/* Lungs - Right Chest */}
            <g 
              onClick={() => setSelected(bodyParts[1])}
              onMouseEnter={() => setHovered('lungs')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <ellipse cx="122" cy="112" rx="22" ry="20" fill={hovered==='lungs' || selected.id==='lungs' ? '#09090b' : 'white'} stroke="#e4e4e7" strokeWidth="1.5" className="transition-all" />
              <text x="122" y="117" textAnchor="middle" fontSize="14" fill={hovered==='lungs' || selected.id==='lungs' ? 'white' : '#71717a'} className="pointer-events-none">◐</text>
              <text x="162" y="115" textAnchor="middle" fontSize="8.5" fill="#52525b" className="pointer-events-none font-medium">Lungs</text>
            </g>

            {/* Body Outline - faint */}
            <path d="M70 78 L60 160 L65 260 L85 260 L90 160 L110 160 L115 260 L135 260 L140 160 L130 78 Z" fill="none" stroke="#f4f4f5" strokeWidth="1" />
            
            {/* Temp - Center Abdomen */}
            <g 
              onClick={() => setSelected(bodyParts[3])}
              onMouseEnter={() => setHovered('temp')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect x="85" y="155" width="30" height="28" rx="9" fill={hovered==='temp' || selected.id==='temp' ? '#09090b' : 'white'} stroke="#e4e4e7" strokeWidth="1.5" className="transition-all" />
              <text x="100" y="173" textAnchor="middle" fontSize="13" fill={hovered==='temp' || selected.id==='temp' ? 'white' : '#71717a'} className="pointer-events-none">◒</text>
            </g>

            {/* Blood - Lower */}
            <g 
              onClick={() => setSelected(bodyParts[4])}
              onMouseEnter={() => setHovered('blood')}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect x="80" y="200" width="40" height="26" rx="9" fill={hovered==='blood' || selected.id==='blood' ? '#09090b' : 'white'} stroke="#e4e4e7" strokeWidth="1.5" className="transition-all" />
              <text x="100" y="217" textAnchor="middle" fontSize="11" fill={hovered==='blood' || selected.id==='blood' ? 'white' : '#71717a'} className="pointer-events-none">⬢</text>
            </g>

            {/* Labels bottom */}
            <text x="100" y="245" textAnchor="middle" fontSize="8" fill="#a1a1aa">Temp</text>
            <text x="100" y="285" textAnchor="middle" fontSize="8" fill="#a1a1aa">Blood Sugar</text>
          </svg>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {bodyParts.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${selected.id===p.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'}`}
              >
                {p.label.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[14px]">{selected.icon}</div>
              <div>
                <div className="text-[13px] font-semibold text-zinc-900 tracking-[-0.01em]">{selected.label}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{selected.vital}</div>
              </div>
            </div>
            <div className="text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{selected.hazard}</div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <div className="text-[10px] tracking-[0.08em] text-zinc-500 font-medium mb-1.5">WHY IN SPACE? - NASA HRP 5 Hazards</div>
              <p className="text-[12px] leading-[1.6] text-zinc-700">{selected.whySpace}</p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-4 text-white">
              <div className="text-[10px] tracking-[0.08em] text-zinc-400 font-medium mb-1.5">SIMPLE INSTRUCTION - What to do</div>
              <p className="text-[12px] leading-[1.6] text-zinc-100">{selected.instruction}</p>
              <div className="mt-3 flex items-center gap-2 text-[10px]">
                <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">Normal: {selected.normal}</span>
                <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">Action: { "< 2 min" }</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-zinc-200 p-3">
                <div className="text-[10px] text-zinc-500">Measurement</div>
                <div className="text-[12px] font-medium text-zinc-900 mt-1">How: Sensor / Manual</div>
                <div className="text-[10px] text-zinc-500 mt-1">Daily routine check</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3">
                <div className="text-[10px] text-zinc-500">When to Worry</div>
                <div className="text-[12px] font-medium text-zinc-900 mt-1">Color: Red/Yellow</div>
                <div className="text-[10px] text-zinc-500 mt-1">Auto alert trigger</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3">
                <div className="text-[10px] text-zinc-500">Prevention</div>
                <div className="text-[12px] font-medium text-zinc-900 mt-1">Exercise + Nutrition</div>
                <div className="text-[10px] text-zinc-500 mt-1">NASA countermeasures</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-zinc-400">
            Reference: NASA Human Research Program - Evidence Report | NASA-STD-3001 Vol 1 & 2 | OSDR Twins Study
          </div>
        </div>
      </div>
    </div>
  );
}
