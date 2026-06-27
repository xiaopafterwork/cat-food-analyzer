'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, CatFood } from '@/lib/supabase'

const ACCENT = '#3D5A3E'

function getScoreBadge(score: number | null): { bg: string; color: string } {
  if (!score) return { bg: '#f3f4f6', color: '#6b7280' }
  if (score >= 80) return { bg: '#e8f9ee', color: '#1a7f37' }
  if (score >= 65) return { bg: '#e6f0fb', color: '#1554a0' }
  if (score >= 50) return { bg: '#fff3e0', color: '#b35c00' }
  return { bg: '#ffeaea', color: '#c0392b' }
}

const LIFE_STAGE_LABEL: Record<string, string> = {
  kitten: '幼貓', adult: '成貓', senior: '熟齡貓', all: '全齡',
}

function ScoreBar({ score, label, max = 40 }: { score: number | null; label: string; max?: number }) {
  const val = score ?? 0
  const pct = Math.round((val / max) * 100)
  const badge = getScoreBadge(Math.round((val / max) * 100))
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color: badge.color }}>{val} / {max}</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: badge.color }} />
      </div>
    </div>
  )
}

export default function FoodDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [food, setFood] = useState<CatFood | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    async function fetchFood() {
      const { data } = await supabase.from('cat_foods').select('*').eq('id', id).single()
      setFood(data as CatFood)
      setLoading(false)
    }
    if (id) fetchFood()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">載入中…</div>
  if (!food) return <div className="min-h-screen flex items-center justify-center text-gray-400">找不到此飼料</div>

  const badge = getScoreBadge(food.score_total)

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 px-4 pt-3 pb-2">
        <div
          className="max-w-2xl mx-auto flex items-center px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '0.5px solid #e5e7eb' }}
        >
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: ACCENT }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            返回
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Header card */}
        <div className="rounded-3xl p-6 mb-4 mt-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="flex items-start gap-4">
            {/* Score circle */}
            <div
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0"
              style={{ background: badge.bg }}
            >
              <span className="font-bold leading-none" style={{ fontSize: 30, color: badge.color }}>{food.score_total ?? '–'}</span>
              <span className="text-xs mt-0.5" style={{ color: badge.color }}>/ 100</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-bold text-gray-900" style={{ fontSize: 20 }}>{food.name}</h1>
              </div>
              <p className="text-sm text-gray-400 mb-2">{food.brand}</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                  {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                </span>
                {!food.has_grain && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>}
                {food.has_grain && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>}
                {food.score_label && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: badge.bg, color: badge.color }}>
                    {food.score_label}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Score bar */}
          <div className="mt-4 w-full h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
            <div className="h-full rounded-full" style={{ width: `${food.score_total ?? 0}%`, background: badge.color }} />
          </div>
        </div>

        {/* AI Summary */}
        {food.ai_summary && (
          <div className="flex flex-col gap-2 mb-4">
            {food.ai_summary.good && (
              <div className="flex gap-3 p-4 rounded-2xl" style={{ background: '#e8f9ee' }}>
                <span className="shrink-0">✅</span>
                <p className="text-sm" style={{ color: '#1a4731' }}>{food.ai_summary.good}</p>
              </div>
            )}
            {food.ai_summary.warning && (
              <div className="flex gap-3 p-4 rounded-2xl" style={{ background: '#fff8ed' }}>
                <span className="shrink-0">⚠️</span>
                <p className="text-sm" style={{ color: '#7c4a00' }}>{food.ai_summary.warning}</p>
              </div>
            )}
            {food.ai_summary.bad && (
              <div className="flex gap-3 p-4 rounded-2xl" style={{ background: '#ffeaea' }}>
                <span className="shrink-0">❌</span>
                <p className="text-sm" style={{ color: '#7f1d1d' }}>{food.ai_summary.bad}</p>
              </div>
            )}
          </div>
        )}

        {/* Suitable */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: ACCENT }}>適合對象</p>
            <p className="text-sm text-gray-700 leading-relaxed">{food.ai_suitable_for ?? '–'}</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
            <p className="text-xs font-semibold mb-2 text-red-500">不適合對象</p>
            <p className="text-sm text-gray-700 leading-relaxed">{food.ai_not_suitable ?? '–'}</p>
          </div>
        </div>

        {/* Expandable detail */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <button
            onClick={() => setShowDetail(v => !v)}
            className="w-full flex justify-between items-center px-5 py-4 text-sm font-semibold"
            style={{ color: ACCENT }}
          >
            完整分析
            <svg
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ transform: showDetail ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {showDetail && (
            <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: '#f3f4f6' }}>
              <ScoreBar score={food.score_ingredient} label="成分評分" max={40} />
              <ScoreBar score={food.score_nutrition} label="營養評分" max={30} />
              <ScoreBar score={food.score_transparency} label="透明度評分" max={30} />

              {food.ai_pros && food.ai_pros.length > 0 && (
                <div className="mt-5 p-4 rounded-xl" style={{ background: '#e8f9ee' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#1a7f37' }}>優點</p>
                  <ul className="space-y-1">
                    {(food.ai_pros as string[]).map((p, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: '#1a4731' }}>
                        <span className="shrink-0">·</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {food.ai_cons && food.ai_cons.length > 0 && (
                <div className="mt-3 p-4 rounded-xl" style={{ background: '#ffeaea' }}>
                  <p className="text-xs font-semibold mb-2 text-red-500">缺點</p>
                  <ul className="space-y-1">
                    {(food.ai_cons as string[]).map((c, i) => (
                      <li key={i} className="text-sm flex gap-2" style={{ color: '#7f1d1d' }}>
                        <span className="shrink-0">·</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
