import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { food_id, nickname, rating, body } = await req.json()

  if (!food_id || !nickname?.trim() || !body?.trim() || !rating) {
    return NextResponse.json({ error: '缺少必填欄位' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: '星等需介於 1–5' }, { status: 400 })
  }
  if (body.trim().length < 5) {
    return NextResponse.json({ error: '留言至少需要 5 個字' }, { status: 400 })
  }

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
