import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '比較 | 喵評鑑',
  description: '同時比較多款貓咪飼料與主食罐的成分、營養數據和評分，幫你快速找出最適合你家貓咪的選擇。',
  openGraph: {
    title: '比較 | 喵評鑑',
    description: '並排比較飼料與主食罐成分與評分',
    url: 'https://meowpj.com/compare',
    siteName: '喵評鑑',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
