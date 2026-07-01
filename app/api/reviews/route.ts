import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const submitTimestamps = new Map<string, number>()
const RATE_LIMIT_MS = 30_000

export async function POST(req: NextRequest) {
  const { food_id, nickname, rating, body } = await req.json()

  if (typeof food_id !== 'string' || typeof nickname !== 'string' || typeof body !== 'string' || typeof rating !== 'number') {
    return NextResponse.json({ error: '缺少必填欄位' }, { status: 400 })
  }
  if (!food_id || !nickname.trim() || !body.trim()) {
    return NextResponse.json({ error: '缺少必填欄位' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '星等需介於 1–5' }, { status: 400 })
  }
  if (body.trim().length < 5) {
    return NextResponse.json({ error: '留言至少需要 5 個字' }, { status: 400 })
  }
  if (nickname.trim().length > 20) {
    return NextResponse.json({ error: '暱稱最多 20 個字' }, { status: 400 })
  }
  if (body.trim().length > 500) {
    return NextResponse.json({ error: '留言最多 500 個字' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const lastSubmit = submitTimestamps.get(ip)
  if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
    return NextResponse.json({ error: '送出太頻繁，請稍後再試' }, { status: 429 })
  }
  submitTimestamps.set(ip, Date.now())

  const { error } = await supabase.from('reviews').insert({
    food_id,
    nickname: nickname.trim(),
    rating,
    body: body.trim(),
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
