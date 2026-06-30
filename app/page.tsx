'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, CatFood } from '@/lib/supabase'
import Nav from '@/components/Nav'

const ACCENT = '#1B3A5C'

function getScoreBadge(score: number | null): { bg: string; color: string } {
  if (!score) return { bg: '#f3f4f6', color: '#6b7280' }
  if (score >= 75) return { bg: '#e8f9ee', color: '#1a7f37' }
  if (score >= 60) return { bg: '#edf5f0', color: '#4a7c59' }
  if (score >= 45) return { bg: '#fff3e0', color: '#b35c00' }
  return { bg: '#ffeaea', color: '#c0392b' }
}

const LIFE_STAGE_LABEL: Record<string, string> = {
  kitten: '幼貓', adult: '成貓', senior: '熟齡貓', all: '全齡',
}


export default function HomePage() {
  const [query, setQuery] = useState('')
  const [lifeStageFilter, setLifeStageFilter] = useState<string | null>(null)
  const [grainFilter, setGrainFilter] = useState(false)
  const [foods, setFoods] = useState<CatFood[]>([])
  const [loading, setLoading] = useState(true)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [toast, setToast] = useState('')
  const [visibleCount, setVisibleCount] = useState(20)
  const router = useRouter()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    supabase.from('cat_foods').select('id', { count: 'exact', head: true })
      .then(({ count }) => setTotalCount(count))
    try {
      const saved = JSON.parse(localStorage.getItem('compareIds') || '[]')
      if (Array.isArray(saved) && saved.length > 0) setCompareIds(saved)
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('compareIds', JSON.stringify(compareIds))
  }, [compareIds])

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
      const results = (data as CatFood[]) ?? []
      setFoods(results)
      setVisibleCount(20)
      setLoading(false)

      if (query.trim().length >= 3) {
        supabase.from('search_logs').insert({
          query: query.trim(),
          result_count: results.length,
        })
      }
    }
    fetchFoods()
  }, [query, lifeStageFilter, grainFilter])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function toggleCompare(id: string) {
    const limit = isMobile ? 3 : 5
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < limit) return [...prev, id]
      showToast(isMobile ? '最多比較 3 款飼料，請先取消一款再新增' : '最多比較 5 款飼料，請先取消一款再新增')
      return prev
    })
  }

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg pointer-events-none"
          style={{ background: '#f97316', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}

      {/* ── Nav ── */}
      <Nav
        rightSlot={
          compareIds.length > 0 ? (
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
          )
        }
      />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── Hero（精簡版）── */}
        <div className="pt-8 pb-5">
          <h1 className="text-3xl font-bold text-gray-900 mb-1.5" style={{ letterSpacing: '-0.5px' }}>
            貓飼料怎麼選？<br />看分數就知道
          </h1>
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
            成分透明・科學評分・新手也看得懂・
            <Link href="/how-we-score" className="underline underline-offset-2" style={{ color: ACCENT }}>評分怎麼算？</Link>
            {totalCount != null && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>
                已收錄 {totalCount} 款飼料
              </span>
            )}
          </p>
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
              style={{ background: '#fff', border: '0.5px solid #d1d5db', color: '#1a1a1a' }}
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-2 flex-wrap mb-6">
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
                className="px-4 py-1.5 rounded-full text-sm font-medium"
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
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={grainFilter
              ? { background: '#e8f9ee', color: '#1a7f37', border: '0.5px solid #86efac' }
              : { background: '#fff', color: '#374151', border: '0.5px solid #d1d5db' }}
          >
            無穀
          </button>
        </div>

        {/* ── Food list ── */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase text-gray-400" style={{ letterSpacing: '0.08em' }}>
            評分排行 {!loading && foods.length > 0 && <span className="font-normal normal-case">· {foods.length} 款</span>}
          </p>
          {compareIds.length === 0 && !loading && foods.length > 0 && (
            <p className="text-xs text-gray-400">☑ 點右側格子可比較</p>
          )}
        </div>
        {loading ? (
          <p className="text-center text-gray-400 py-12">載入中…</p>
        ) : foods.length === 0 ? (
          <p className="text-center text-gray-400 py-12">找不到符合的飼料</p>
        ) : (
          <div className="flex flex-col gap-3 mb-8">
            {foods.slice(0, visibleCount).map((food, index) => {
              const badge = getScoreBadge(food.score_total)
              const inCompare = compareIds.includes(food.id)
              const rank = index + 1
              return (
                <div
                  key={food.id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
                >
                  {/* 左：圓圈 + 等級 */}
                  <Link href={`/food/${food.id}`} className="shrink-0 flex flex-col items-center gap-1.5">
                    <div
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.6, marginBottom: 1 }}>#{rank}</span>
                      <span style={{ fontSize: 26, lineHeight: 1.1 }}>{food.score_total ?? '–'}</span>
                      <span style={{ fontSize: 10, opacity: 0.6 }}>/ 100</span>
                    </div>
                    {food.score_label && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-center" style={{ background: '#f3f4f6', color: '#374151', border: '0.5px solid #e5e7eb' }}>{food.score_label}</span>
                    )}
                  </Link>

                  {/* 右：名稱、品牌、標籤 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/food/${food.id}`} className="block">
                      <p className="font-semibold text-gray-900 truncate mb-0.5" style={{ fontSize: 15 }}>{food.name}</p>
                    </Link>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/brand/${encodeURIComponent(food.brand)}`) }}
                      className="text-xs mb-1.5 underline underline-offset-2 block text-left font-medium"
                      style={{ color: ACCENT }}
                    >{food.brand}</button>
                    <div className="flex gap-1.5 flex-wrap">
                      {!food.has_grain && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>
                      )}
                      {food.has_grain && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>
                      )}
                      {food.is_aafco_certified && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: '#EEF3F8', color: '#1B3A5C' }}>AAFCO</span>
                      )}
                      {(food.carb_dm_pct ?? 100) <= 10 && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fef3e2', color: '#92520b' }}>低碳水</span>
                      )}
                      {(food.protein_dm_pct ?? 0) >= 40 && (
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fef3e2', color: '#92520b' }}>高肉含量</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                        {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                      </span>
                    </div>
                  </div>

                  {/* Compare checkbox */}
                  <button
                    onClick={() => toggleCompare(food.id)}
                    className="shrink-0 w-6 h-6 rounded flex items-center justify-center border"
                    style={inCompare
                      ? { background: ACCENT, borderColor: ACCENT }
                      : { background: '#fff', borderColor: '#d1d5db' }}
                    title={inCompare ? '移出比較' : `加入比較（最多${isMobile ? 3 : 5}款）`}
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
            {visibleCount < foods.length && (
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: '#fff', border: '0.5px solid #e5e7eb', color: '#374151' }}
              >
                顯示更多（還有 {foods.length - visibleCount} 款）
              </button>
            )}
          </div>
        )}

        {/* ── CTA 區 ── */}
        <div className="flex flex-col gap-3">
          <Link
            href="/brands"
            className="w-full text-center py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#fff', border: '0.5px solid #e5e7eb', color: '#374151' }}
          >
            查看所有品牌 →
          </Link>
          <div className="text-center py-6 rounded-2xl" style={{ background: '#EEF3F8', border: '0.5px solid #C8D9E8' }}>
            <p className="text-sm font-semibold text-gray-800 mb-1">這份分析對你有幫助嗎？</p>
            <p className="text-xs mb-4" style={{ color: '#555' }}>你的支持讓我們繼續分析更多飼料 ☕</p>
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: ACCENT }}>
              ☕ 支持喵評鑑
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating compare bar ── */}
      {compareIds.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl"
          style={{ background: '#1d1d1f', color: '#fff', whiteSpace: 'nowrap' }}
        >
          <span className="text-sm">已選 {compareIds.length} / {isMobile ? 3 : 5} 款</span>
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
