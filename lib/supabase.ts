import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type CatFood = {
  id: string
  name: string
  brand: string
  life_stage: string
  food_type: string
  country: string | null
  source_url: string | null
  ingredients_raw: string | null
  ingredients_list: unknown
  protein_pct: number | null
  fat_pct: number | null
  fiber_pct: number | null
  moisture_pct: number | null
  ash_pct: number | null
  carb_dm_pct: number | null
  protein_dm_pct: number | null
  fat_dm_pct: number | null
  score_total: number | null
  score_ingredient: number | null
  score_nutrition: number | null
  score_transparency: number | null
  score_label: string | null
  ai_summary: { good?: string; warning?: string; bad?: string } | null
  ai_pros: string[] | null
  ai_cons: string[] | null
  ai_suitable_for: string | null
  ai_not_suitable: string | null
  has_grain: boolean
  has_allergen: boolean
  has_4d_meat: boolean
  is_aafco_certified: boolean
  aafco_statement: string | null
  created_at: string
  updated_at: string
}
