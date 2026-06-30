import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import BrandDetailClient from './BrandDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
)

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brandName = decodeURIComponent(params.brand)
  const { data } = await supabase
    .from('cat_foods')
    .select('brand, score_total, food_type')
    .ilike('brand', `%${brandName}%`)
    .order('score_total', { ascending: false })

  const count = data?.length ?? 0
  const topScore = data?.[0]?.score_total ?? 0

  return {
    title: `${brandName} 貓飼料評價｜${count} 款成分分析 - 喵評鑑`,
    description: `${brandName} 乾飼料與主食罐成分分析評分。共 ${count} 款，最高評分 ${topScore} 分。喵評鑑 — 成分透明、科學評分。`,
    alternates: { canonical: `https://meowpj.com/brand/${params.brand}` },
    openGraph: {
      title: `${brandName} 貓飼料評價 | 喵評鑑`,
      description: `${brandName} 共 ${count} 款飼料，最高分 ${topScore} 分`,
      url: `https://meowpj.com/brand/${params.brand}`,
      siteName: '喵評鑑',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: `${brandName} | 喵評鑑` }],
    },
  }
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const brandName = decodeURIComponent(params.brand)

  const { data: foods } = await supabase
    .from('cat_foods')
    .select('*')
    .ilike('brand', `%${brandName}%`)
    .order('score_total', { ascending: false })

  if (!foods || foods.length === 0) {
    return (
      <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
        <Nav backHref="/brands" />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-gray-400">
          找不到「{brandName}」的資料
        </div>
      </main>
    )
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandName} 貓飼料評分列表`,
    itemListElement: foods.slice(0, 10).map((food, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: food.name,
      url: `https://meowpj.com/food/${food.id}`,
    })),
  }

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/brands" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <BrandDetailClient brandName={brandName} foods={foods} />
    </main>
  )
}
