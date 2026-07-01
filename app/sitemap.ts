import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// 只在「部署時」產生一次並永久靜態化，之後每次抓取都是秒回，
// 絕不在請求當下打 DB（避免 Google 抓 sitemap 時因 10 秒延遲而擷取失敗）。
// 資料更新後重新部署即會重建 sitemap。
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://meowpj.com'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Supabase 單次上限 1000 筆，需分頁抓取全部
  type FoodRow = { id: string; brand: string | null; updated_at: string | null }
  const foods: FoodRow[] = []
  for (let offset = 0; offset < 10000; offset += 1000) {
    const { data } = await supabase
      .from('cat_foods')
      .select('id, brand, updated_at')
      .order('score_total', { ascending: false })
      .range(offset, offset + 999)
    if (!data || data.length === 0) break
    foods.push(...(data as FoodRow[]))
    if (data.length < 1000) break
  }

  const foodUrls: MetadataRoute.Sitemap = foods.map(f => ({
    url: `${BASE}/food/${f.id}`,
    lastModified: f.updated_at ? new Date(f.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // 品牌頁（去重）
  const brandSet: Record<string, boolean> = {}
  for (const f of foods) { if (f.brand) brandSet[f.brand] = true }
  const brands = Object.keys(brandSet)
  const brandUrls: MetadataRoute.Sitemap = brands.map(brand => ({
    url: `${BASE}/brand/${encodeURIComponent(brand)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/how-we-score`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/request`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ...foodUrls,
    ...brandUrls,
  ]
}
