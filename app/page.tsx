'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [lifeStageFilter, setLifeStageFilter] = useState<string | null>(null)
  const [foods, setFoods] = useState<CatFood[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFoods() {
      setLoading(true)
      let q = supabase
        .from('cat_foods')
        .select('*')
        .order('score_total', { ascending: false })

      if (lifeStageFilter) q = q.eq('life_stage', lifeStageFilter)
      if (query.trim()) {
        const keyword = `%${query.trim()}%`
        q = q.or(`name.ilike.${keyword},brand.ilike.${keyword}`)
      }

      const { data } = await q
      setFoods((data as CatFood[]) ?? [])
      setLoading(false)
    }
    fetchFoods()
  }, [query, lifeStageFilter])

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLOR }}>
          🐱 貓咪飼料分析
        </h1>
        <p className="text-gray-500 text-sm">幫你的貓找最適合的飼料</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="輸入飼料品牌或名稱，例如：法國皇家 K36"
          className="w-full text-base px-5 py-4 rounded-2xl border-2 outline-none shadow-sm transition"
          style={{ borderColor: BRAND_COLOR }}
        />
      </div>

      {/* Quick filter */}
      <div className="max-w-2xl mx-auto flex gap-3 mb-12 justify-center">
        {[
          { label: '幼貓', value: 'kitten' },
          { label: '成貓', value: 'adult' },
          { label: '熟齡貓', value: 'senior' },
        ].map(item => (
          <button
            key={item.value}
            onClick={() =>
              setLifeStageFilter(prev => (prev === item.value ? null : item.value))
            }
            className="px-5 py-2 rounded-full text-sm font-medium border-2 transition"
            style={
              lifeStageFilter === item.value
                ? { backgroundColor: BRAND_COLOR, color: '#fff', borderColor: BRAND_COLOR }
                : { backgroundColor: '#fff', color: BRAND_COLOR, borderColor: BRAND_COLOR }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Food list */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold mb-5" style={{ color: BRAND_COLOR }}>
          熱門飼料
        </h2>

        {loading ? (
          <p className="text-center text-gray-400 py-12">載入中…</p>
        ) : foods.length === 0 ? (
          <p className="text-center text-gray-400 py-12">找不到符合的飼料</p>
        ) : (
          <div className="flex flex-col gap-4">
            {foods.map(food => (
              <Link key={food.id} href={`/food/${food.id}`}>
                <div className="rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition bg-white flex items-center gap-5">
                  {/* Score */}
                  <div
                    className="text-4xl font-bold w-16 text-center shrink-0"
                    style={{ color: getScoreColor(food.score_total) }}
                  >
                    {food.score_total ?? '–'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 truncate">{food.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#e8f0e8', color: BRAND_COLOR }}
                      >
                        {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{food.brand}</p>
                    {food.score_label && (
                      <p className="text-sm text-gray-600 truncate">{food.score_label}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
