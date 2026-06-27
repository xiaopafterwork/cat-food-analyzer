'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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

function NutrBar({ value, max, color }: { value: number | null; max: number; color: string }) {
  const pct = Math.min(Math.round(((value ?? 0) / max) * 100), 100)
  return (
    <div className="w-full h-2 rounded-full overflow-hidden mt-1" style={{ background: '#f3f4f6' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 5)
  const [foods, setFoods] = useState<CatFood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ids.length) { setLoading(false); return }
    supabase.from('cat_foods').select('*').in('id', ids).then(({ data }) => {
      const sorted = (data as CatFood[] ?? []).sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0))
      setFoods(sorted)
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  if (loading) return <p className="text-center text-gray-400 py-16">載入中…</p>
  if (!foods.length) return (
    <div className="text-center py-16">
      <p className="text-gray-400 mb-4">沒有選擇飼料</p>
      <Link href="/" className="text-sm font-semibold" style={{ color: ACCENT }}>← 返回選擇</Link>
    </div>
  )

  const rows: { label: string; render: (f: CatFood) => React.ReactNode }[] = [
    {
      label: '綜合評分',
      render: f => {
        const b = getScoreBadge(f.score_total)
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: b.bg, color: b.color }}>
              {f.score_total ?? '–'}
            </div>
            <span className="text-xs" style={{ color: b.color }}>{f.score_label ?? ''}</span>
          </div>
        )
      }
    },
    {
      label: '品牌',
      render: f => <span className="text-xs text-gray-500 text-center block">{f.brand}</span>
    },
    {
      label: '適用階段',
      render: f => <span className="text-xs text-gray-600">{LIFE_STAGE_LABEL[f.life_stage] ?? f.life_stage}</span>
    },
    {
      label: '含穀物',
      render: f => f.has_grain
        ? <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>
        : <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>
    },
    {
      label: '蛋白質 DM%',
      render: f => (
        <div className="w-full">
          <span className="text-sm font-semibold text-gray-800">{f.protein_dm_pct?.toFixed(1) ?? '–'}%</span>
          <NutrBar value={f.protein_dm_pct} max={60} color="#1a7f37" />
        </div>
      )
    },
    {
      label: '脂肪 DM%',
      render: f => (
        <div className="w-full">
          <span className="text-sm font-semibold text-gray-800">{f.fat_dm_pct?.toFixed(1) ?? '–'}%</span>
          <NutrBar value={f.fat_dm_pct} max={50} color="#1554a0" />
        </div>
      )
    },
    {
      label: '碳水 DM%',
      render: f => (
        <div className="w-full">
          <span className="text-sm font-semibold text-gray-800">{f.carb_dm_pct?.toFixed(1) ?? '–'}%</span>
          <NutrBar value={f.carb_dm_pct} max={60} color="#b35c00" />
        </div>
      )
    },
    {
      label: 'AAFCO 認證',
      render: f => f.is_aafco_certified
        ? <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>有</span>
        : <span className="text-xs text-gray-400">–</span>
    },
    {
      label: '成分評分',
      render: f => <span className="text-sm font-semibold text-gray-700">{f.score_ingredient ?? '–'} / 40</span>
    },
    {
      label: '營養評分',
      render: f => <span className="text-sm font-semibold text-gray-700">{f.score_nutrition ?? '–'} / 30</span>
    },
    {
      label: '透明度評分',
      render: f => <span className="text-sm font-semibold text-gray-700">{f.score_transparency ?? '–'} / 30</span>
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: foods.length * 140 + 100 }}>
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-400 font-medium py-2 pr-4" style={{ width: 100 }}>比較項目</th>
            {foods.map(f => (
              <th key={f.id} className="py-2 px-2 text-center" style={{ width: 140 }}>
                <Link href={`/food/${f.id}`} className="text-xs font-semibold text-gray-900 hover:underline line-clamp-2 block">
                  {f.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: '0.5px solid #f3f4f6' }}>
              <td className="py-4 pr-4 text-xs text-gray-500 font-medium align-middle" style={{ whiteSpace: 'nowrap' }}>
                {row.label}
              </td>
              {foods.map(f => (
                <td key={f.id} className="py-4 px-2 text-center align-middle">
                  <div className="flex justify-center">{row.render(f)}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ComparePage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 px-4 pt-3 pb-2">
        <div
          className="max-w-4xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '0.5px solid #e5e7eb' }}
        >
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: ACCENT }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            返回
          </Link>
          <span className="font-semibold text-gray-900 text-sm">飼料比較</span>
          <Link href="/" className="text-sm" style={{ color: ACCENT }}>喵評鑑</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pb-16 mt-6">
        <div className="rounded-3xl p-6" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <Suspense fallback={<p className="text-center text-gray-400 py-8">載入中…</p>}>
            <CompareContent />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
