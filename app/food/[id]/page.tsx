'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, CatFood } from '@/lib/supabase'
import Nav from '@/components/Nav'

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

// 熱量比計算（代謝能 Atwater 係數）
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
      <span className="text-xs text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center leading-none select-none"
        style={{ fontSize: 9, fontWeight: 600 }}>i</span>
      <span className={`absolute left-1/2 -translate-x-1/2 z-50 hidden group-hover:flex
        w-48 px-3 py-2 rounded-xl text-xs text-gray-700 leading-relaxed shadow-lg pointer-events-none
        ${down ? 'top-full mt-1.5' : 'bottom-full mb-1.5'}`}
        style={{ background: 'rgba(255,255,255,0.97)', border: '0.5px solid #e5e7eb', backdropFilter: 'blur(8px)' }}>
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
      <Nav backHref="/" />

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
                {food.is_aafco_certified && (
                  <span className="relative group inline-flex items-center text-xs px-2 py-0.5 rounded-md cursor-default" style={{ background: '#e6f0fb', color: '#1554a0' }}>
                    AAFCO
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 hidden group-hover:flex
                      w-52 px-3 py-2 rounded-xl text-xs text-gray-700 leading-relaxed shadow-lg pointer-events-none"
                      style={{ background: 'rgba(255,255,255,0.97)', border: '0.5px solid #e5e7eb', backdropFilter: 'blur(8px)' }}>
                      通過美國飼料管理協會（AAFCO）認證，代表此配方符合貓咪完整營養需求的最低標準。
                    </span>
                  </span>
                )}
                {(food.carb_dm_pct ?? 100) <= 10 && (
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fff3e0', color: '#b35c00' }}>低碳水</span>
                )}
                {(food.protein_dm_pct ?? 0) >= 40 && (
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#fce7f3', color: '#9d174d' }}>高肉含量</span>
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

        {/* 營養數據卡 */}
        {(() => {
          const caloric = calcCaloric(food.protein_dm_pct, food.fat_dm_pct, food.carb_dm_pct)
          return (
            <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              {/* 區塊一：包裝保證值 */}
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

              {/* 分隔線 */}
              <div style={{ height: '0.5px', background: '#f3f4f6', margin: '0 20px' }} />

              {/* 區塊二：乾物比 */}
              <div className="px-5 pt-3 pb-3">
                <p className="text-xs font-semibold uppercase mb-1 flex items-center" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>
                  乾物比 <span className="font-normal normal-case ml-1">（排除水分後，同基準比較）</span>
                  <Tooltip text="乾糧含水量約 10%，濕食約 75%，直接比較不公平。乾物比把水分扣除後重新計算，讓不同種類飼料可以直接比較蛋白質真實含量。" />
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <NutrCard label="蛋白質" value={food.protein_dm_pct != null ? food.protein_dm_pct.toFixed(1) : null} />
                  <NutrCard label="脂肪"   value={food.fat_dm_pct     != null ? food.fat_dm_pct.toFixed(1)     : null} />
                  <NutrCard label="碳水"   value={food.carb_dm_pct    != null ? food.carb_dm_pct.toFixed(1)    : null} />
                </div>
              </div>

              {/* 分隔線 */}
              <div style={{ height: '0.5px', background: '#f3f4f6', margin: '0 20px' }} />

              {/* 區塊三：熱量比 */}
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
                        ✓ 蛋白質熱量佔 {caloric.protein}%，達 CatInfo.org 建議的 40% 以上
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
