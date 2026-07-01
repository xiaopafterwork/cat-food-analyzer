import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import BrandDetailClient from './BrandDetailClient'

export const revalidate = 86400 // ISR：第一次點擊時建立快取，24小時後自動更新

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  const avgScore = count > 0
    ? Math.round((data ?? []).reduce((s, f) => s + (f.score_total ?? 0), 0) / count)
    : 0

  return {
    title: `${brandName} 評鑑｜${count} 款成分分析 - 喵評鑑`,
    description: `${brandName} 旗下 ${count} 款飼料與主食罐，平均 ${avgScore} 分，最高 ${topScore} 分。成分拆給你看。`,
    alternates: { canonical: `https://meowpj.com/brand/${params.brand}` },
    openGraph: {
      title: `${brandName} 評鑑 | 喵評鑑`,
      description: `${brandName} 旗下 ${count} 款飼料與主食罐，平均 ${avgScore} 分，最高 ${topScore} 分。成分拆給你看。`,
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
