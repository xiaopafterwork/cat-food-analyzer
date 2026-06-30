'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACCENT = '#1B3A5C'

function getScoreBadge(score: number | null) {
  if (!score) return { bg: '#f3f4f6', color: '#6b7280' }
  if (score >= 75) return { bg: '#e8f9ee', color: '#1a7f37' }
  if (score >= 60) return { bg: '#e8eff7', color: '#3a6090' }
  if (score >= 45) return { bg: '#fff3e0', color: '#b35c00' }
  return { bg: '#ffeaea', color: '#c0392b' }
}

const LIFE_STAGE_LABEL: Record<string, string> = {
  kitten: '幼貓', adult: '成貓', senior: '熟齡貓', all: '全齡',
}

type Food = {
  id: string
  name: string
  brand: string
  score_total: number | null
  food_type: string
  has_grain: boolean | null
  is_aafco_certified: boolean | null
  life_stage: string
  ai_summary: unknown
}

export default function BrandDetailClient({ brandName, foods }: { brandName: string; foods: Food[] }) {
  const dryFoods = foods.filter(f => f.food_type !== 'wet')
  const wetFoods = foods.filter(f => f.food_type === 'wet')
  const hasBoth = dryFoods.length > 0 && wetFoods.length > 0

  const [tab, setTab] = useState<'dry' | 'wet'>(dryFoods.length > 0 ? 'dry' : 'wet')

  const activeFoods = tab === 'wet' ? wetFoods : dryFoods

  const avgScore = activeFoods.length
    ? Math.round(activeFoods.reduce((s, f) => s + (f.score_total ?? 0), 0) / activeFoods.length)
    : 0
  const topScore = activeFoods.length ? Math.max(...activeFoods.map(f => f.score_total ?? 0)) : 0
  const grainFreeCount = activeFoods.filter(f => !f.has_grain).length

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">

      {/* Brand header */}
      <div className="rounded-3xl p-6 mt-4 mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{brandName}</h1>
        <p className="text-sm text-gray-400 mb-4">
          喵評鑑收錄 {foods.length} 款
          {hasBoth && <span className="ml-2 text-xs">（乾飼料 {dryFoods.length} 款・主食罐 {wetFoods.length} 款）</span>}
        </p>

        {/* Tab — 只有兩種都有才顯示 */}
        {hasBoth && (
          <div className="flex gap-0 mb-4 rounded-2xl overflow-hidden" style={{ background: '#f5f5f7', border: '0.5px solid #e5e7eb' }}>
            {(['dry', 'wet'] as const).map((t, i) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: tab === t ? ACCENT : 'transparent',
                  color: tab === t ? '#fff' : '#6b7280',
                  borderRight: i === 0 ? '0.5px solid #e5e7eb' : 'none',
                }}>
                {t === 'dry' ? `乾飼料 ${dryFoods.length} 款` : `主食罐 ${wetFoods.length} 款`}
              </button>
            ))}
          </div>
        )}

        {/* Stats — 依 tab 計算 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>{avgScore}</span>
            <span className="text-xs text-gray-400 mt-0.5">平均評分</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>{topScore}</span>
            <span className="text-xs text-gray-400 mt-0.5">最高評分</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>{grainFreeCount}</span>
            <span className="text-xs text-gray-400 mt-0.5">無穀款數</span>
          </div>
        </div>
      </div>

      {/* Food list */}
      <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>
        {tab === 'wet' ? '主食罐' : '乾飼料'}排行
        <span className="font-normal normal-case"> · {activeFoods.length} 款</span>
      </p>

      <div className="flex flex-col gap-3">
        {activeFoods.map(food => {
          const badge = getScoreBadge(food.score_total)
          const summary = typeof food.ai_summary === 'string'
            ? food.ai_summary.split(/[。！？]/)[0]
            : ''
          return (
            <Link
              key={food.id}
              href={`/food/${food.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
            >
              <div
                className="w-16 h-16 rounded-full flex flex-col items-center justify-center shrink-0 font-bold"
                style={{ background: badge.bg, color: badge.color }}
              >
                <span style={{ fontSize: 22, lineHeight: 1.1 }}>{food.score_total ?? '–'}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>/ 100</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate mb-0.5" style={{ fontSize: 15 }}>{food.name}</p>
                {summary && (
                  <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{summary}。</p>
                )}
                <div className="flex gap-1.5 flex-wrap">
                  {food.food_type === 'wet' && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: '#EEF3F8', color: '#1B3A5C' }}>主食罐</span>
                  )}
                  {!food.has_grain && food.food_type !== 'wet' && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>
                  )}
                  {food.has_grain && (
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>
                  )}
                  {food.is_aafco_certified && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: '#EEF3F8', color: '#1B3A5C' }}>AAFCO</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                    {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                  </span>
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href="/brands" className="text-sm underline underline-offset-2" style={{ color: ACCENT }}>
          查看所有品牌 →
        </Link>
      </div>
    </div>
  )
}
