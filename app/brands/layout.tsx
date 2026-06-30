import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '所有品牌 | 喵評鑑',
  description: '台灣貓飼料品牌完整列表。皇家、希爾思、法米納、冠能等所有品牌評分排行，找到最適合你家貓咪的飼料品牌。',
  openGraph: {
    title: '所有品牌 | 喵評鑑',
    description: '台灣貓飼料品牌完整評分排行',
    url: 'https://meowpj.com/brands',
    siteName: '喵評鑑',
  },
}

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return children
}
