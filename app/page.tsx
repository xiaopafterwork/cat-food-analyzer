'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

const FEATURES = [
  { icon: '⚖️', title: '比較模式', desc: '選 2–5 款，一眼看差異' },
  { icon: '🔍', title: '進階篩選', desc: '無穀、灰分、蛋白質範圍' },
  { icon: '⭐', title: '我的收藏', desc: '儲存常看的飼料', soon: true },
  { icon: '🐟', title: '罐頭評鑑', desc: '濕食即將上線', soon: true },
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [lifeStageFilter, setLifeStageFilter] = useState<string | null>(null)
  const [grainFilter, setGrainFilter] = useState(false)
  const [foods, setFoods] = useState<CatFood[]>([])
  const [loading, setLoading] = useState(true)
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true)
      let q = supabase.from('cat_foods').select('*').order('score_total', { ascending: false })
      if (lifeStageFilter) q = q.eq('life_stage', lifeStageFilter)
      if (grainFilter) q = q.eq('has_grain', false)
      if (query.trim()) {
        const words = query.trim().split(/\s+/).filter(Boolean)
        const conditions = words.flatMap(w => [`name.ilike.%${w}%`, `brand.ilike.%${w}%`])
        q = q.or(conditions.join(','))
      }
      const { data } = await q
      setFoods((data as CatFood[]) ?? [])
      setLoading(false)
    }
    fetchFoods()
  }, [query, lifeStageFilter, grainFilter])

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    )
  }

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 px-4 pt-3 pb-2">
        <div
          className="max-w-2xl mx-auto flex justify-between items-center px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '0.5px solid #e5e7eb' }}
        >
          <span className="font-semibold text-gray-900" style={{ fontSize: 17, letterSpacing: '-0.3px' }}>喵評鑑</span>
          <div className="flex gap-2">
            {compareIds.length > 0 ? (
              <Link
                href={`/compare?ids=${compareIds.join(',')}`}
                className="text-sm font-semibold px-4 py-1.5 rounded-full text-white"
                style={{ background: ACCENT }}
              >
                比較 {compareIds.length} 款
              </Link>
            ) : (
              <button
                className="text-sm px-4 py-1.5 rounded-full"
                style={{ border: '0.5px solid #d1d5db', color: '#374151', background: '#fff' }}
                onClick={() => alert('請先勾選飼料加入比較')}
              >
                比較
              </button>
            )}
            <button
              className="text-sm px-4 py-1.5 rounded-full"
              style={{ border: '0.5px solid #d1d5db', color: '#374151', background: '#fff' }}
            >
              支持我們
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── Hero ── */}
        <div className="text-center pt-10 pb-8">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: ACCENT, letterSpacing: '0.08em' }}>
            台灣最完整貓飼料評鑑
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-1px', lineHeight: 1.1 }}>
            找到最適合<br />你家貓的飼料
          </h1>
          <p className="text-gray-500 text-base mb-7">成分透明・科學評分・新手也看得懂</p>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜尋品牌或飼料名稱…"
              className="w-full pl-11 pr-5 py-3.5 rounded-full text-base outline-none"
              style={{ background: '#fff', border: '0.5px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {([
            { label: '全部', value: null },
            { label: '幼貓', value: 'kitten' },
            { label: '成貓', value: 'adult' },
            { label: '全齡', value: 'all' },
          ] as { label: string; value: string | null }[]).map(item => {
            const active = item.value === null ? lifeStageFilter === null && !grainFilter : lifeStageFilter === item.value
            return (
              <button
                key={item.label}
                onClick={() => { setLifeStageFilter(item.value); if (item.value === null) setGrainFilter(false) }}
                className="px-5 py-2 rounded-full text-sm font-medium"
                style={active
                  ? { background: '#1d1d1f', color: '#fff', border: '0.5px solid #1d1d1f' }
                  : { background: '#fff', color: '#374151', border: '0.5px solid #d1d5db' }}
              >
                {item.label}
              </button>
            )
          })}
          <button
            onClick={() => setGrainFilter(v => !v)}
            className="px-5 py-2 rounded-full text-sm font-medium"
            style={grainFilter
              ? { background: '#e8f9ee', color: '#1a7f37', border: '0.5px solid #86efac' }
              : { background: '#fff', color: '#374151', border: '0.5px solid #d1d5db' }}
          >
            無穀
          </button>
        </div>

        {/* ── Food list ── */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>評分排行</p>
        {loading ? (
          <p className="text-center text-gray-400 py-12">載入中…</p>
        ) : foods.length === 0 ? (
          <p className="text-center text-gray-400 py-12">找不到符合的飼料</p>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {foods.map(food => {
              const badge = getScoreBadge(food.score_total)
              const inCompare = compareIds.includes(food.id)
              return (
                <div
                  key={food.id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
                >
                  {/* Score circle */}
                  <Link href={`/food/${food.id}`} className="shrink-0">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {food.score_total ?? '–'}
                    </div>
                  </Link>

                  {/* Info */}
                  <Link href={`/food/${food.id}`} className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate mb-0.5" style={{ fontSize: 15 }}>{food.name}</p>
                    <p className="text-sm text-gray-400 mb-2">{food.brand}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {!food.has_grain && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>
                      )}
                      {food.has_grain && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>
                      )}
                      {food.is_aafco_certified && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e6f0fb', color: '#1554a0' }}>AAFCO</span>
                      )}
                      {(food.carb_dm_pct ?? 100) <= 10 && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fff3e0', color: '#b35c00' }}>低碳水</span>
                      )}
                      {(food.protein_dm_pct ?? 0) >= 40 && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fce7f3', color: '#9d174d' }}>高肉含量</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                        {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                      </span>
                    </div>
                  </Link>

                  {/* Compare checkbox */}
                  <button
                    onClick={() => toggleCompare(food.id)}
                    className="shrink-0 w-6 h-6 rounded flex items-center justify-center border"
                    style={inCompare
                      ? { background: ACCENT, borderColor: ACCENT }
                      : { background: '#fff', borderColor: '#d1d5db' }}
                    title={inCompare ? '移出比較' : '加入比較（最多5款）'}
                  >
                    {inCompare && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Compare banner ── */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6"
          style={{ background: '#1d1d1f' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">多款飼料一起比</p>
            <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>最多同時比較 5 款</p>
          </div>
          <Link
            href={compareIds.length > 0 ? `/compare?ids=${compareIds.join(',')}` : '#'}
            onClick={e => { if (compareIds.length === 0) { e.preventDefault(); alert('請先勾選飼料加入比較') } }}
            className="text-sm font-semibold px-4 py-2 rounded-full text-white"
            style={{ background: ACCENT }}
          >
            開始比較
          </Link>
        </div>

        {/* ── Feature cards ── */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>功能建議</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="p-4 rounded-2xl"
              style={{ background: '#fff', border: '0.5px solid #e5e7eb', opacity: f.soon ? 0.6 : 1 }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-gray-900 text-sm mb-1">
                {f.title}{f.soon && <span className="ml-1.5 text-xs text-gray-400">即將上線</span>}
              </p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Donate ── */}
        <div
          className="text-center px-6 py-8 rounded-2xl"
          style={{ background: '#e8f9ee', border: '0.5px solid #b2e0bb' }}
        >
          <p className="font-semibold text-gray-900 mb-1.5">喜歡這個網站嗎？</p>
          <p className="text-sm mb-5" style={{ color: '#555' }}>你的支持讓我們繼續分析更多飼料 ☕</p>
          <button
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: ACCENT }}
          >
            支持喵評鑑
          </button>
        </div>
      </div>

      {/* ── Floating compare bar ── */}
      {compareIds.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl"
          style={{ background: '#1d1d1f', color: '#fff', whiteSpace: 'nowrap' }}
        >
          <span className="text-sm">已選 {compareIds.length} / 5 款</span>
          <Link
            href={`/compare?ids=${compareIds.join(',')}`}
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{ background: ACCENT }}
          >
            開始比較
          </Link>
          <button onClick={() => setCompareIds([])} className="text-gray-400 text-xl leading-none ml-1">×</button>
        </div>
      )}
    </main>
  )
}
