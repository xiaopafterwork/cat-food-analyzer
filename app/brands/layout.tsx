import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '所有品牌 | 喵評鑑',
  description: '所有品牌飼料與主食罐評分排行。皇家、希爾思、法米納、冠能等品牌，成分一覽無遺。',
  openGraph: {
    title: '所有品牌 | 喵評鑑',
    description: '所有品牌飼料與主食罐評分排行',
    url: 'https://meowpj.com/brands',
    siteName: '喵評鑑',
  },
}

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children
}
