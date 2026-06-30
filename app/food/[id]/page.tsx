import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import FoodDetailClient from './FoodDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
  )
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = getSupabase()
  const { data: food } = await supabase
    .from('cat_foods')
    .select('name, brand, score_total, score_label, protein_dm_pct, carb_dm_pct, ai_summary')
    .eq('id', params.id)
    .single()

  if (!food) return { title: '飼料評分 | 喵評鑑' }

  const summary = typeof food.ai_summary === 'string'
    ? food.ai_summary.split(/[。！？]/)[0]
    : ''

  const description = `${food.name}成分分析。蛋白質（乾重）${food.protein_dm_pct?.toFixed(1) ?? '–'}%、碳水${food.carb_dm_pct?.toFixed(1) ?? '–'}%，喵評鑑綜合評分 ${food.score_total} 分（${food.score_label}）。${summary ? summary + '。' : ''}台灣貓奴最信賴的飼料成分分析平台。`

  return {
    title: `${food.name} 評分 ${food.score_total} 分 | 喵評鑑`,
    description: description.slice(0, 155),
    openGraph: {
      title: `${food.name} 評分 ${food.score_total} 分 | 喵評鑑`,
      description: description.slice(0, 100),
      url: `https://meowpj.com/food/${params.id}`,
      siteName: '喵評鑑',
    },
  }
}

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const [{ data: food }, { data: reviews }] = await Promise.all([
    supabase.from('cat_foods').select('*').eq('id', params.id).single(),
    supabase.from('reviews').select('id, nickname, rating, body, created_at')
      .eq('food_id', params.id).eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ])

  if (!food) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">找不到此飼料</div>
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: food.name,
    brand: { '@type': 'Brand', name: food.brand },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(food.score_total ?? 0),
        bestRating: '100',
        worstRating: '0',
      },
      author: { '@type': 'Organization', name: '喵評鑑' },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FoodDetailClient food={food} reviews={reviews ?? []} />
    </>
  )
}
