import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '飼料比較 | 喵評鑑',
  description: '同時比較多款貓飼料的成分、營養數據和評分，幫你快速找出最適合你家貓咪的選擇。',
  openGraph: {
    title: '飼料比較 | 喵評鑑',
    description: '並排比較貓飼料成分與評分',
    url: 'https://meowpj.com/compare',
    siteName: '喵評鑑',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
