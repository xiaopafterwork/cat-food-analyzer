'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Nav from '@/components/Nav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ACCENT = '#1B3A5C'

function getScoreColor(score: number) {
  if (score >= 75) return '#1a7f37'
  if (score >= 60) return '#1554a0'
  if (score >= 45) return '#b35c00'
  return '#c0392b'
}

type BrandStat = { name: string; count: number; avgScore: number; topScore: number }

export default function BrandsPage() {
  const [allBrands, setAllBrands] = useState<BrandStat[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('cat_foods').select('brand, score_total').then(({ data }) => {
      if (!data) return
      const map: Record<string, { count: number; scores: number[] }> = {}
      for (const f of data) {
        const b = f.brand || '其他'
        if (!map[b]) map[b] = { count: 0, scores: [] }
        map[b].count++
        if (f.score_total != null) map[b].scores.push(f.score_total)
      }
      const brands = Object.entries(map)
        .map(([name, { count, scores }]) => ({
          name,
          count,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          topScore: scores.length ? Math.max(...scores) : 0,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
      setAllBrands(brands)
      setLoading(false)
    })
  }, [])

  const brands = query.trim()
    ? allBrands.filter(b => b.name.toLowerCase().includes(query.trim().toLowerCase()))
    : allBrands

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">所有品牌</h1>
          <p className="text-sm text-gray-400 mb-4">
            {loading ? '載入中…' : `共 ${allBrands.length} 個品牌・${allBrands.reduce((s, b) => s + b.count, 0)} 款飼料`}
          </p>
          {/* 搜尋框 */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜尋品牌名稱…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none"
              style={{ background: '#fff', border: '0.5px solid #d1d5db', color: '#1a1a1a' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
              >×</button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">載入中…</p>
        ) : brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">找不到「{query}」</p>
            <button onClick={() => setQuery('')} className="text-sm underline" style={{ color: ACCENT }}>清除搜尋</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {brands.map(brand => (
              <Link
                key={brand.name}
                href={`/brand/${encodeURIComponent(brand.name)}`}
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
              >
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">{brand.name}</p>
                  <p className="text-xs text-gray-400">{brand.count} 款飼料</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">平均分</p>
                    <p className="font-bold text-lg leading-none" style={{ color: getScoreColor(brand.avgScore) }}>
                      {brand.avgScore}
                    </p>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm underline underline-offset-2" style={{ color: ACCENT }}>
            查看所有飼料評分 →
          </Link>
        </div>
      </div>
    </main>
  )
}
