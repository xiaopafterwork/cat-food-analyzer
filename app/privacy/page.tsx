import type { Metadata } from 'next'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '隱私權政策 — 喵評鑑',
  description: '喵評鑑如何蒐集、使用與保護你的個人資料。',
  alternates: { canonical: 'https://meowpj.com/privacy' },
}

const ACCENT = '#1B3A5C'
const UPDATED = '2026-07-01'

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '一、我們是誰',
    body: (
      <>
        喵評鑑（MEOWPJ，網址 meowpj.com）是一個貓咪飼料與主食罐的成分分析與評分平台。
        本政策說明我們在你使用本網站時，如何蒐集、使用與保護你的個人資料。
      </>
    ),
  },
  {
    title: '二、我們蒐集哪些資料',
    body: (
      <>
        本網站沒有會員註冊系統，不會蒐集你的真實姓名、電話或地址。我們僅在以下情況蒐集有限資料：
        <ul className="list-disc pl-5 mt-2 space-y-1.5">
          <li><strong>瀏覽數據</strong>：透過 Google Analytics 蒐集你的瀏覽行為、裝置類型、大致地區與 IP，用於了解網站使用情形。</li>
          <li><strong>搜尋記錄</strong>：當你在站內搜尋時，我們會記錄搜尋關鍵字（不含任何身分資訊），用於改善收錄內容。</li>
          <li><strong>留言內容</strong>：當你主動留言時，我們會儲存你填寫的暱稱、評分與留言文字。請勿在留言中填寫個人敏感資訊。</li>
          <li><strong>捐款資訊</strong>：若你透過金流服務支持我們，交易由第三方金流商處理，我們不會經手或儲存你的信用卡號等付款資料。</li>
        </ul>
      </>
    ),
  },
  {
    title: '三、資料的使用目的',
    body: (
      <>
        我們蒐集的資料僅用於：改善網站內容與使用體驗、統計熱門飼料與主食罐、顯示使用者留言，以及處理你主動發起的捐款。
        我們不會將你的資料販售或提供給無關的第三方作行銷用途。
      </>
    ),
  },
  {
    title: '四、Cookie 的使用',
    body: (
      <>
        本網站使用 Cookie（主要來自 Google Analytics）來記錄匿名的瀏覽統計。
        你可以透過瀏覽器設定拒絕或刪除 Cookie，但部分功能的統計可能因此無法正常運作。
      </>
    ),
  },
  {
    title: '五、第三方服務',
    body: (
      <>
        為了提供服務，我們使用以下第三方，你的部分資料可能會經過它們處理：
        <ul className="list-disc pl-5 mt-2 space-y-1.5">
          <li><strong>Google Analytics</strong>：網站流量與行為分析。</li>
          <li><strong>Supabase</strong>：資料庫與留言、搜尋記錄的儲存。</li>
          <li><strong>Vercel</strong>：網站主機與部署。</li>
          <li><strong>金流服務商（綠界 ECPay / Ko-fi 等）</strong>：處理捐款交易。</li>
        </ul>
        這些服務各有自己的隱私權政策，建議你一併參閱。
      </>
    ),
  },
  {
    title: '六、你的權利',
    body: (
      <>
        依據《個人資料保護法》，你有權查詢、更正或要求刪除我們持有的你的個人資料（例如你留下的留言）。
        如有相關需求，請來信 <a href="mailto:xiaopafterwork@gmail.com" className="underline" style={{ color: ACCENT }}>xiaopafterwork@gmail.com</a>，我們會盡快處理。
      </>
    ),
  },
  {
    title: '七、免責聲明',
    body: (
      <>
        本網站所有評分與內容僅供參考，不構成獸醫診斷或醫療建議。若你的貓咪有特殊疾病，請務必在更換飼料前諮詢獸醫。
        飼料配方可能因批次或年份調整，實際成分請以產品標示為主。
      </>
    ),
  },
  {
    title: '八、政策更新',
    body: (
      <>
        我們可能會不定期修訂本政策，更新後將於本頁公告，恕不另行個別通知。建議你定期查閱本頁以掌握最新內容。
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" backLabel="返回首頁" title="隱私權政策" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Hero */}
        <div className="text-center pt-10 pb-8">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>
            隱私權政策
          </h1>
          <p className="text-gray-400 text-xs">最後更新：{UPDATED}</p>
        </div>

        {/* 條款卡片 */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map(section => (
            <div key={section.title} className="rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-2">{section.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed">{section.body}</div>
            </div>
          ))}
        </div>

        {/* 聯絡 */}
        <div
          className="text-center px-6 py-6 rounded-2xl mt-6"
          style={{ background: '#EEF3F8', border: '0.5px solid #C8D9E8' }}
        >
          <p className="text-sm text-gray-700">
            對隱私權有任何疑問，歡迎來信{' '}
            <a href="mailto:xiaopafterwork@gmail.com" className="font-semibold underline" style={{ color: ACCENT }}>
              xiaopafterwork@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
