'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, CatFood } from '@/lib/supabase'

const BRAND_COLOR = '#3D5A3E'

function getScoreColor(score: number | null): string {
  if (!score) return '#6b7280'
  if (score >= 80) return '#22c55e'
  if (score >= 65) return '#3b82f6'
  if (score >= 50) return '#f97316'
  if (score >= 35) return '#ef4444'
  return '#991b1b'
}

const LIFE_STAGE_LABEL: Record<string, string> = {
  kitten: '幼貓',
  adult: '成貓',
  senior: '熟齡貓',
  all: '全齡',
}

function ScoreBar({ score, label, max = 40 }: { score: number | null; label: string; max?: number }) {
  const val = score ?? 0
  const pct = Math.round((val / max) * 100)
  const color = getScoreColor(Math.round((val / max) * 100))
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold" style={{ color }}>{val} / {max}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
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
      const { data } = await supabase
        .from('cat_foods')
        .select('*')
        .eq('id', id)
        .single()
      setFood(data as CatFood)
      setLoading(false)
    }
    if (id) fetchFood()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">載入中…</div>
  if (!food) return <div className="min-h-screen flex items-center justify-center text-gray-400">找不到此飼料</div>

  const scoreColor = getScoreColor(food.score_total)
  const scorePct = food.score_total ?? 0

  return (
    <main className="min-h-screen bg-white px-4 py-10 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm mb-8 flex items-center gap-1"
        style={{ color: BRAND_COLOR }}
      >
        ← 返回
      </button>

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold text-gray-800">{food.name}</h1>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#e8f0e8', color: BRAND_COLOR }}
          >
            {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
          </span>
        </div>
        <p className="text-gray-400">{food.brand}</p>
      </div>

      {/* Big Score */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="font-bold leading-none mb-3"
          style={{ fontSize: 72, color: scoreColor }}
        >
          {food.score_total ?? '–'}
        </div>
        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${scorePct}%`, backgroundColor: scoreColor }}
          />
        </div>
        {food.score_label && (
          <p className="text-sm font-medium" style={{ color: scoreColor }}>
            {food.score_label}
          </p>
        )}
      </div>

      {/* AI Summary */}
      {food.ai_summary && (
        <div className="flex flex-col gap-3 mb-10">
          {food.ai_summary.good && (
            <div className="flex gap-3 p-4 rounded-xl bg-green-50">
              <span>✅</span>
              <p className="text-sm text-gray-700">{food.ai_summary.good}</p>
            </div>
          )}
          {food.ai_summary.warning && (
            <div className="flex gap-3 p-4 rounded-xl bg-orange-50">
              <span>⚠️</span>
              <p className="text-sm text-gray-700">{food.ai_summary.warning}</p>
            </div>
          )}
          {food.ai_summary.bad && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-50">
              <span>❌</span>
              <p className="text-sm text-gray-700">{food.ai_summary.bad}</p>
            </div>
          )}
        </div>
      )}

      {/* Suitable / Not suitable */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-xs font-semibold mb-2" style={{ color: BRAND_COLOR }}>適合對象</p>
          <p className="text-sm text-gray-700">{food.ai_suitable_for ?? '–'}</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-50">
          <p className="text-xs font-semibold mb-2 text-red-500">不適合對象</p>
          <p className="text-sm text-gray-700">{food.ai_not_suitable ?? '–'}</p>
        </div>
      </div>

      {/* Expandable detail */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowDetail(v => !v)}
          className="w-full flex justify-between items-center px-5 py-4 text-sm font-semibold"
          style={{ color: BRAND_COLOR }}
        >
          完整分析
          <span>{showDetail ? '▲' : '▼'}</span>
        </button>
        {showDetail && (
          <div className="px-5 pb-5 pt-1">
            <ScoreBar score={food.score_ingredient} label="成分評分" max={40} />
            <ScoreBar score={food.score_nutrition} label="營養評分" max={30} />
            <ScoreBar score={food.score_transparency} label="透明度評分" max={30} />

            {/* Pros / Cons */}
            {food.ai_pros && (
              <div className="mt-5">
                <p className="text-xs font-semibold mb-2 text-green-600">優點</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(food.ai_pros as string[]).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            {food.ai_cons && (
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2 text-red-500">缺點</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(food.ai_cons as string[]).map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
