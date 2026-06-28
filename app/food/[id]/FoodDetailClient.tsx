'use client'

import Nav from '@/components/Nav'
import { CatFood } from '@/lib/supabase'


function getScoreBadge(score: number | null): { bg: string; color: string } {
  if (!score) return { bg: '#f3f4f6', color: '#6b7280' }
  if (score >= 85) return { bg: '#e8f9ee', color: '#1a7f37' }
  if (score >= 70) return { bg: '#e6f0fb', color: '#1554a0' }
  if (score >= 50) return { bg: '#fff3e0', color: '#b35c00' }
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

// ai_summary 存的是字串，直接顯示
function parseSummary(summary: unknown): string {
  if (!summary) return ''
  if (typeof summary === 'string') return summary
  if (typeof summary === 'object' && summary !== null) {
    const s = summary as Record<string, string>
    return [s.good, s.warning, s.bad].filter(Boolean).join('。') + '。'
  }
  return ''
}

// ai_pros/ai_cons 存的是「、」分隔的字串
function parseList(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val).split(/[、，,]/).map(s => s.trim()).filter(Boolean)
}

export default function FoodDetailClient({ food }: { food: CatFood }) {
  const badge = getScoreBadge(food.score_total)
  const pros = parseList(food.ai_pros)
  const cons = parseList(food.ai_cons)

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
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
              <a href={`/brand/${encodeURIComponent(food.brand)}`} className="text-sm text-gray-400 mb-2 underline inline-block">{food.brand}</a>
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
          <div className="mt-4 w-full h-2 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
            <div className="h-full rounded-full" style={{ width: `${food.score_total ?? 0}%`, background: badge.color }} />
          </div>
        </div>

        {/* 成分亮點 */}
        <div className="p-4 rounded-2xl mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280', letterSpacing: '0.06em' }}>成分亮點</p>
          <div className="flex flex-wrap gap-2">
            {(food.protein_dm_pct ?? 0) >= 50 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>✓ 蛋白質（乾重）{food.protein_dm_pct?.toFixed(1)}%，極高</span>
            )}
            {(food.protein_dm_pct ?? 0) >= 40 && (food.protein_dm_pct ?? 0) < 50 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>✓ 蛋白質（乾重）{food.protein_dm_pct?.toFixed(1)}%，優秀</span>
            )}
            {(food.protein_dm_pct ?? 0) < 30 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#ffeaea', color: '#c0392b' }}>! 蛋白質（乾重）{food.protein_dm_pct?.toFixed(1)}%，偏低</span>
            )}
            {(food.carb_dm_pct ?? 100) <= 10 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>✓ 碳水（乾重）{food.carb_dm_pct?.toFixed(1)}%，極低</span>
            )}
            {(food.carb_dm_pct ?? 0) > 30 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#ffeaea', color: '#c0392b' }}>! 碳水（乾重）{food.carb_dm_pct?.toFixed(1)}%，偏高</span>
            )}
            {!food.has_grain && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>✓ 無穀配方</span>
            )}
            {food.has_grain && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#ffeaea', color: '#c0392b' }}>! 含穀物成分</span>
            )}
            {food.is_aafco_certified && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e6f0fb', color: '#1554a0' }}>✓ AAFCO 認證</span>
            )}
            {!food.is_aafco_certified && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>— 未標示 AAFCO 認證</span>
            )}
            {food.ash_pct != null && food.ash_pct <= 8 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#e8f9ee', color: '#1a7f37' }}>✓ 灰分 {food.ash_pct}%，低</span>
            )}
            {food.ash_pct != null && food.ash_pct > 10 && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#ffeaea', color: '#c0392b' }}>! 灰分 {food.ash_pct}%，偏高</span>
            )}
            {food.ash_pct == null && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>— 灰分未公開</span>
            )}
          </div>
        </div>

        {/* 營養數據卡 */}
        {(() => {
          const caloric = calcCaloric(food.protein_dm_pct, food.fat_dm_pct, food.carb_dm_pct)
          return (
            <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
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
                  乾物比 <span className="font-normal normal-case ml-1">（排除水分後，同基準比較）</span>
                  <Tooltip text="乾糧含水量約 10%，濕食約 75%，直接比較不公平。乾物比把水分扣除後重新計算，讓不同種類飼料可以直接比較蛋白質真實含量。" />
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <NutrCard label="蛋白質" value={food.protein_dm_pct != null ? food.protein_dm_pct.toFixed(1) : null} />
                  <NutrCard label="脂肪"   value={food.fat_dm_pct     != null ? food.fat_dm_pct.toFixed(1)     : null} />
                  <NutrCard label="碳水"   value={food.carb_dm_pct    != null ? food.carb_dm_pct.toFixed(1)    : null} />
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
                        ✓ 蛋白質熱量佔 {caloric.protein}%，達 AAFCO 建議標準的 40% 以上
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

        {/* 成分分析 */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="flex flex-col gap-3 mb-4">
            {pros.length > 0 && (
              <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#1a7f37' }}>成分優勢</p>
                <ul className="space-y-1.5">
                  {pros.map((p, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: '#1a4731' }}>
                      <span className="shrink-0">·</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
                <p className="text-xs font-semibold mb-2 text-red-400">成分注意</p>
                <ul className="space-y-1.5">
                  {cons.map((c, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: '#7f1d1d' }}>
                      <span className="shrink-0">·</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 免責聲明 */}
        <p className="text-xs text-center leading-relaxed mb-6" style={{ color: '#9ca3af' }}>
          ⚠️ 本站評分依據成分數據計算，不構成獸醫建議。<br />
          有特殊疾病或健康需求的貓咪，請諮詢獸醫後再做選擇。
        </p>
      </div>
    </main>
  )
}
