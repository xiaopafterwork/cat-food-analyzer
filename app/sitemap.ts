import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = 'https://meowpj.com'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
  )

  const { data: foods } = await supabase
    .from('cat_foods')
    .select('id, brand, updated_at')
    .order('score_total', { ascending: false })

  const foodUrls: MetadataRoute.Sitemap = (foods ?? []).map(f => ({
    url: `${BASE}/food/${f.id}`,
    lastModified: f.updated_at ? new Date(f.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // 品牌頁（去重）
  const brandSet: Record<string, boolean> = {}
  for (const f of foods ?? []) { if (f.brand) brandSet[f.brand] = true }
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
