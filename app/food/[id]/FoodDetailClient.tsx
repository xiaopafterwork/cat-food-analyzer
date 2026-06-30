'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { CatFood } from '@/lib/supabase'

const ACCENT = '#3D5A3E'

type Review = { id: string; nickname: string; rating: number; body: string; created_at: string }

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: 14 }}>★</span>
      ))}
    </span>
  )
}

function ReviewForm({ foodId }: { foodId: string }) {
  const [nickname, setNickname] = useState('')
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [hover, setHover] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit() {
    if (!nickname.trim() || !rating || !body.trim()) return
    setStatus('loading')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_id: foodId, nickname, rating, body }),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <div className="text-center py-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">感謝你的留言！</p>
        <p className="text-xs text-gray-400">審核通過後就會顯示在這裡 🐾</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="你的暱稱"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        maxLength={20}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style={{ border: '0.5px solid #d1d5db', background: '#fafafa' }}
      />
      {/* 星等選擇 */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">評分</span>
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            style={{ fontSize: 24, color: i <= (hover || rating) ? '#f59e0b' : '#d1d5db', lineHeight: 1 }}
          >★</button>
        ))}
      </div>
      <textarea
        placeholder="分享你的使用心得…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{ border: '0.5px solid #d1d5db', background: '#fafafa' }}
      />
      {status === 'error' && <p className="text-xs text-red-400">送出失敗，請稍後再試</p>}
      <button
        onClick={submit}
        disabled={!nickname.trim() || !rating || !body.trim() || status === 'loading'}
        className="w-full py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: ACCENT }}
      >
        {status === 'loading' ? '送出中…' : '送出留言'}
      </button>
    </div>
  )
}


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

function calcCaloric(protein_dm: number | null, fat_dm: number | null, carb_dm: number | null) {
  const p = protein_dm ?? 0
  const f = fat_dm ?? 0
  const c = carb_dm ?? 0
  const total = p * 3.5 + f * 8.5 + c * 3.5
  if (total === 0) return null
  return {
    protein: Math.round((p * 3.5 / total) * 100),
    fat:     Math.round((f * 8.5 / total) * 100),
    carb:    Math.round((c * 3.5 / total) * 100),
  }
}

function NutrCard({ label, value, unit = '%', sub }: { label: string; value: string | number | null; unit?: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 mb-0.5">{label}</span>
      <span className="font-semibold text-gray-900 text-sm">
        {value != null ? `${value}${unit}` : '–'}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

function Tooltip({ text, down }: { text: string; down?: boolean }) {
  return (
    <span className="relative group inline-flex items-center ml-1 cursor-default">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 text-gray-400">
        <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1"/>
        <circle cx="7.5" cy="5" r="0.8" fill="currentColor"/>
        <line x1="7.5" y1="7" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      <span className={`absolute left-1/2 -translate-x-1/2 z-[9999] hidden group-hover:flex
        w-52 px-3 py-2.5 rounded-xl text-xs text-gray-700 leading-relaxed shadow-xl pointer-events-none
        ${down ? 'top-full mt-2' : 'bottom-full mb-2'}`}
        style={{ background: '#fff', border: '0.5px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        {text}
      </span>
    </span>
  )
}

function CaloricBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{pct}%</span>
    </div>
  )
}

function IngredientsBlock({ raw }: { raw: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!raw) return null
  const preview = raw.slice(0, 120)
  const needsExpand = raw.length > 120
  return (
    <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
      <div className="px-5 py-4">
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>原料列表</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {expanded || !needsExpand ? raw : `${preview}…`}
        </p>
        {needsExpand && (
          <button onClick={() => setExpanded(v => !v)} className="text-xs mt-2 underline" style={{ color: '#3D5A3E' }}>
            {expanded ? '收合' : '顯示全部'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function FoodDetailClient({ food, reviews }: { food: CatFood; reviews: Review[] }) {
  const badge = getScoreBadge(food.score_total)
  const aiSummary = food.ai_summary
  const [inCompare, setInCompare] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)

  function shareToThreads() {
    const url = `https://meowpj.com/food/${food.id}`
    const text = `${food.name} 在喵評鑑拿到 ${food.score_total} 分（${food.score_label}）！\n\n成分分析、評分明細都在這裡 👇\n${url}`
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`, '_blank')
  }

  function copyLink() {
    const url = `https://meowpj.com/food/${food.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('compareIds') || '[]')
      setInCompare(ids.includes(food.id))
      setCompareIds(ids)
    } catch {}
  }, [food.id])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function toggleCompare() {
    const limit = isMobile ? 3 : 5
    const ids: string[] = JSON.parse(localStorage.getItem('compareIds') || '[]')
    let newIds: string[]
    if (ids.includes(food.id)) {
      newIds = ids.filter(id => id !== food.id)
    } else if (ids.length < limit) {
      newIds = [...ids, food.id]
    } else {
      showToast(isMobile ? '最多比較 3 款飼料，請先取消一款再新增' : '最多比較 5 款飼料，請先取消一款再新增')
      return
    }
    localStorage.setItem('compareIds', JSON.stringify(newIds))
    setInCompare(newIds.includes(food.id))
    setCompareIds(newIds)
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
      <Nav backHref="/" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Header card */}
        <div className="rounded-3xl p-6 mb-4 mt-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="flex items-start gap-4">
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
              <a href={`/brand/${encodeURIComponent(food.brand)}`} className="text-sm font-medium underline underline-offset-2 inline-block mb-2" style={{ color: ACCENT }}>{food.brand}</a>

              {/* 第一行：評分等級 + 動作按鈕 */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {food.score_label && (
                  <span className="text-xs px-2.5 py-1 rounded-md font-semibold" style={{ background: badge.bg, color: badge.color }}>{food.score_label}</span>
                )}
                <button
                  onClick={toggleCompare}
                  className="text-xs px-2.5 py-1 rounded-md font-medium"
                  style={inCompare ? { background: '#1d1d1f', color: '#fff' } : { background: '#f3f4f6', color: '#374151' }}
                >
                  {inCompare ? '✓ 比較中' : '+ 比較'}
                </button>
                {inCompare && compareIds.length >= 2 && (
                  <Link href={`/compare?ids=${compareIds.join(',')}`} className="text-xs underline" style={{ color: ACCENT }}>前往比較 →</Link>
                )}
                <button onClick={shareToThreads} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: '#1d1d1f', color: '#fff' }}>Threads</button>
                <button onClick={copyLink} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: '#f3f4f6', color: '#374151' }}>
                  {copied ? '✓ 已複製' : '複製連結'}
                </button>
              </div>

              {/* 第二行：成分 / 認證標籤 */}
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                  {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                </span>
                {!food.has_grain && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>}
                {food.has_grain && <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>}
                {food.is_aafco_certified && (
                  <span className="relative group inline-flex items-center text-xs px-2 py-0.5 rounded-md font-semibold cursor-default" style={{ background: '#1e3a5f', color: '#fff' }}>
                    AAFCO
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 hidden group-hover:flex
                      w-52 px-3 py-2 rounded-xl text-xs text-gray-700 leading-relaxed shadow-lg pointer-events-none"
                      style={{ background: 'rgba(255,255,255,0.97)', border: '0.5px solid #e5e7eb', backdropFilter: 'blur(8px)' }}>
                      通過美國飼料管理協會（AAFCO）認證，代表此配方符合貓咪完整營養需求的最低標準。
                    </span>
                  </span>
                )}
                {(food.carb_dm_pct ?? 100) <= 10 && (
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fef3e2', color: '#92520b' }}>低碳水</span>
                )}
                {(food.protein_dm_pct ?? 0) >= 40 && (
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fef3e2', color: '#92520b' }}>高肉含量</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 w-full h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
            <div className="h-full rounded-full" style={{ width: `${food.score_total ?? 0}%`, background: badge.color }} />
          </div>
        </div>

        {/* 成分亮點 */}
        {(() => {
          const good: string[] = []
          const bad: string[] = []
          const neutral: string[] = []
          const p = food.protein_dm_pct ?? 0
          const c = food.carb_dm_pct ?? 100
          if (p >= 50) good.push(`✓ 蛋白質 ${food.protein_dm_pct?.toFixed(1)}%，極高`)
          else if (p >= 40) good.push(`✓ 蛋白質 ${food.protein_dm_pct?.toFixed(1)}%，優秀`)
          else if (p < 30 && food.protein_dm_pct != null) bad.push(`! 蛋白質 ${food.protein_dm_pct.toFixed(1)}%，偏低`)
          if (c <= 10) good.push(`✓ 碳水 ${food.carb_dm_pct?.toFixed(1)}%，極低`)
          else if (c > 30 && food.carb_dm_pct != null) bad.push(`! 碳水 ${food.carb_dm_pct.toFixed(1)}%，偏高`)
          if (!food.has_grain) good.push('✓ 無穀配方')
          else bad.push('! 含穀物成分')
          if (food.is_aafco_certified) good.push('✓ AAFCO 認證')
          else neutral.push('— 未標示 AAFCO')
          if (food.ash_pct != null && food.ash_pct <= 8) good.push(`✓ 灰分 ${food.ash_pct}%，低`)
          else if (food.ash_pct != null && food.ash_pct > 10) bad.push(`! 灰分 ${food.ash_pct}%，偏高`)
          else neutral.push('— 灰分未公開')
          if (good.length === 0 && bad.length === 0 && neutral.length === 0) return null
          return (
            <div className="p-4 rounded-2xl mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>成分亮點</p>
              {good.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {good.map((t, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>{t}</span>)}
                </div>
              )}
              {bad.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {bad.map((t, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#ffeaea', color: '#c0392b' }}>{t}</span>)}
                </div>
              )}
              {neutral.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {neutral.map((t, i) => <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>{t}</span>)}
                </div>
              )}
            </div>
          )
        })()}

        {/* 營養數據卡 */}
        {(() => {
          const caloric = calcCaloric(food.protein_dm_pct, food.fat_dm_pct, food.carb_dm_pct)
          return (
            <div className="rounded-2xl mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <div className="px-5 pt-4 pb-3">
                <p className="text-xs font-semibold uppercase mb-3 flex items-center" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                  包裝保證值 <span className="font-normal normal-case ml-1">（同包裝標示）</span>
                  <Tooltip text="直接來自飼料包裝上的保證分析值，蛋白質與脂肪標示最低值，纖維與水分標示最高值。" down />
                </p>
                <div className="grid grid-cols-5 gap-2">
                  <NutrCard label="粗蛋白質↑" value={food.protein_pct != null ? food.protein_pct.toFixed(1) : null} sub="最低" />
                  <NutrCard label="粗脂肪↑"   value={food.fat_pct     != null ? food.fat_pct.toFixed(1)     : null} sub="最低" />
                  <NutrCard label="粗纖維↓"   value={food.fiber_pct   != null ? food.fiber_pct.toFixed(1)   : null} sub="最高" />
                  <NutrCard label="水分↓"      value={food.moisture_pct != null ? food.moisture_pct.toFixed(1) : null} sub="最高" />
                  <NutrCard label="灰分"       value={food.ash_pct     != null ? food.ash_pct.toFixed(1)     : null} />
                </div>
              </div>

              <div style={{ height: '0.5px', background: '#f3f4f6', margin: '0 20px' }} />

              <div className="px-5 pt-3 pb-3">
                <p className="text-xs font-semibold uppercase mb-1 flex items-center" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                  乾物比
                  <Tooltip text="把飼料的水分去除後重新計算的營養比例，這樣才能公平比較不同飼料的真實含量。喵評鑑的評分就是用這組數字。" />
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <NutrCard label="蛋白質" value={food.protein_dm_pct != null ? food.protein_dm_pct.toFixed(1) : null} />
                  <NutrCard label="脂肪"   value={food.fat_dm_pct     != null ? food.fat_dm_pct.toFixed(1)     : null} />
                  <NutrCard label="碳水"   value={food.carb_dm_pct    != null ? food.carb_dm_pct.toFixed(1)    : null} />
                  <NutrCard label="纖維"   value={food.fiber_dm_pct   != null ? food.fiber_dm_pct.toFixed(1)   : null} />
                  <NutrCard label="灰分"   value={food.ash_dm_pct     != null ? food.ash_dm_pct.toFixed(1)     : null} />
                </div>
              </div>

              <div style={{ height: '0.5px', background: '#f3f4f6', margin: '0 20px' }} />

              <div className="px-5 pt-3 pb-4">
                <p className="text-xs font-semibold uppercase mb-2 flex items-center" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                  熱量來源比 <span className="font-normal normal-case ml-1">（每日攝取能量佔比）</span>
                  <Tooltip text="計算每種營養素提供的熱量佔比。貓咪理想飲食中蛋白質熱量應佔 40% 以上。" />
                </p>
                {caloric ? (
                  <div className="flex flex-col gap-2">
                    <CaloricBar pct={caloric.protein} color="#1a7f37" label="蛋白質" />
                    <CaloricBar pct={caloric.fat}     color="#1554a0" label="脂肪"   />
                    <CaloricBar pct={caloric.carb}    color="#b35c00" label="碳水"   />
                    {caloric.protein >= 40 && (
                      <p className="text-xs mt-1" style={{ color: '#1a7f37' }}>
                        ✓ 蛋白質熱量佔 {caloric.protein}%，符合貓咪每日建議攝取
                      </p>
                    )}
                    {caloric.carb <= 10 && (
                      <p className="text-xs" style={{ color: '#1a7f37' }}>
                        ✓ 碳水熱量僅 {caloric.carb}%，符合貓咪低碳需求
                      </p>
                    )}
                    {caloric.carb > 20 && (
                      <p className="text-xs" style={{ color: '#b35c00' }}>
                        ⚠ 碳水熱量佔 {caloric.carb}%，偏高，長期餵食需留意
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">資料不足，無法計算</p>
                )}
              </div>
            </div>
          )
        })()}

        {/* 原料列表 */}
        <IngredientsBlock raw={food.ingredients_raw} />

        {/* AI 快速總結 */}
        {aiSummary && (aiSummary.good || aiSummary.warning || aiSummary.bad) && (
          <div className="p-4 rounded-2xl mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>成分總結</p>
            <div className="flex flex-col gap-2">
              {aiSummary.good    && <p className="text-sm leading-relaxed" style={{ color: '#1a4731' }}>{aiSummary.good}</p>}
              {aiSummary.warning && <p className="text-sm leading-relaxed" style={{ color: '#92400e' }}>{aiSummary.warning}</p>}
              {aiSummary.bad     && <p className="text-sm leading-relaxed" style={{ color: '#7f1d1d' }}>{aiSummary.bad}</p>}
            </div>
          </div>
        )}

        {/* 留言區 */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-4" style={{ letterSpacing: '0.08em' }}>
            貓奴留言 {reviews.length > 0 && <span className="font-normal normal-case">· {reviews.length} 則</span>}
          </p>

          {/* 已核准留言 */}
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-3 mb-6">
              {reviews.map(r => (
                <div key={r.id} className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{r.nickname}</span>
                    <StarDisplay rating={r.rating} />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
                  <p className="text-xs text-gray-300 mt-2">{new Date(r.created_at).toLocaleDateString('zh-TW')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">還沒有留言，來第一個分享使用心得吧！</p>
          )}

          {/* 留言表單 */}
          <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
            <p className="text-sm font-semibold text-gray-700 mb-3">留下你的評價</p>
            <ReviewForm foodId={food.id} />
          </div>
        </div>

        {/* 支持喵評鑑 */}
        <div
          className="text-center py-8 rounded-2xl mb-8"
          style={{ background: '#e8f9ee', border: '0.5px solid #b2e0bb' }}
        >
          <p className="font-semibold text-gray-900 mb-1.5">這份分析對你有幫助嗎？</p>
          <p className="text-sm mb-5" style={{ color: '#555' }}>你的支持讓我們繼續分析更多飼料</p>
          <button
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#3D5A3E' }}
          >
            <img src="/coffee.png" alt="" width={16} height={16} style={{ objectFit: 'contain' }} />
            支持喵評鑑
          </button>
        </div>
      </div>
    </main>
  )
}
