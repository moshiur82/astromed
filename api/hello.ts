import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase env' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('hello_world')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      status: 'live',
      message: 'Hello World from AstroMed AI',
      timestamp: new Date().toISOString(),
      database: 'connected',
      count: data?.length || 0,
      data,
    })
  }

  if (req.method === 'POST') {
    const { message } = req.body || {}
    const finalMessage = message || 'Hello World from AstroMed AI'

    const { data, error } = await supabase
      .from('hello_world')
      .insert([{ message: finalMessage }])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data: data[0] })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}