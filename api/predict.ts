// api/predict.ts - AstroMed AI Health Prediction ML API
// Exact TypeScript port of api/predict.py
// No external dependencies — runs on Vercel Edge Runtime

export const config = { runtime: 'edge' }

type VitalsInput = {
  heart_rate?: number
  spo2?: number
  temperature?: number
  systolic?: number
  [key: string]: unknown
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
}

function getHandler() {
  return new Response(
    JSON.stringify({
      status: 'live',
      model: 'AstroMed ML v1',
      endpoint: '/api/predict',
      method: 'POST',
      example: { heart_rate: 108, spo2: 93, temperature: 38, systolic: 125 },
      description: 'Python ML API for Health Prediction - Free Tier'
    }),
    { status: 200, headers: CORS }
  )
}

function postHandler(body: VitalsInput) {
  const hr = typeof body.heart_rate === 'number' ? body.heart_rate : 75
  const spo2 = typeof body.spo2 === 'number' ? body.spo2 : 98
  const temp = typeof body.temperature === 'number' ? body.temperature : 36.8
  const systolic = typeof body.systolic === 'number' ? body.systolic : 120

  let risk = 0
  if (hr > 100) risk += 30
  else if (hr < 60) risk += 20
  if (spo2 < 95) risk += 35
  else if (spo2 < 97) risk += 10
  if (temp > 37.5) risk += 25
  else if (temp < 36) risk += 15
  if (systolic > 130) risk += 10

  risk = Math.min(risk, 100)

  let status: string
  if (risk >= 70) status = 'Critical'
  else if (risk >= 40) status = 'Warning'
  else status = 'Normal'

  const prediction = risk < 40 ? 'Healthy' : risk < 70 ? 'At Risk' : 'High Risk'

  const confidence = risk < 50 ? 0.92 : 0.87

  const recommendation =
    risk < 40
      ? 'Continue monitoring'
      : risk < 70
      ? 'Medical check recommended'
      : 'Immediate attention required'

  return new Response(
    JSON.stringify({
      status: 'live',
      model: 'AstroMed ML v1',
      risk_score: risk,
      risk_status: status,
      prediction,
      confidence,
      recommendation,
      input: body
    }),
    { status: 200, headers: CORS }
  )
}

export default async function handler(req: Request): Promise<Response> {
  // OPTIONS — CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS })
  }

  // GET — health/info endpoint
  if (req.method === 'GET') {
    return getHandler()
  }

  // POST — prediction
  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as VitalsInput
      return postHandler(body)
    } catch (e: any) {
      return new Response(JSON.stringify({ error: String(e?.message || e) }), {
        status: 500,
        headers: CORS
      })
    }
  }

  // অন্য যেকোনো method
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: CORS
  })
}