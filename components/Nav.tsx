'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACCENT = '#3D5A3E'

const MENU_ITEMS = [
  { href: '/',               label: '首頁' },
  { href: '/brands',        label: '所有品牌' },
  { href: '/how-we-score',  label: '評分標準' },
  { href: '/request',       label: '新增飼料需求' },
  { href: 'mailto:xiaopafterwork@gmail.com', label: '聯絡我們', external: true },
]

interface NavProps {
  /** 左側返回按鈕，不傳則顯示 Logo */
  backHref?: string
  backLabel?: string
  /** 中間標題，不傳則不顯示 */
  title?: string
  /** 右側額外按鈕（如「比較 N 款」） */
  rightSlot?: React.ReactNode
}

export default function Nav({ backHref, backLabel = '返回', title, rightSlot }: NavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 px-4 pt-3 pb-2">
        <div
          className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '0.5px solid #e5e7eb' }}
        >
          {/* 左側：返回或 Logo */}
          {backHref ? (
            <Link href={backHref} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: ACCENT }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              {backLabel}
            </Link>
          ) : (
            <Link href="/" className="font-semibold text-gray-900" style={{ fontSize: 17, letterSpacing: '-0.3px' }}>
              喵評鑑
            </Link>
          )}

          {/* 中間標題 */}
          {title && (
            <span className="font-semibold text-gray-900 text-sm absolute left-1/2 -translate-x-1/2">{title}</span>
          )}

          {/* 右側 */}
          <div className="flex items-center gap-2">
            {rightSlot}
            {/* 支持按鈕 */}
            <a
              href="https://ko-fi.com/miaopingjian"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: ACCENT }}
            >
              ☕ 支持
            </a>
            {/* 漢堡 / 關閉按鈕 */}
            <button
              onClick={() => setOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: open ? '#f3f4f6' : 'transparent' }}
              aria-label={open ? '關閉選單' : '開啟選單'}
            >
              {open ? (
                <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 下拉選單 */}
        {open && (
          <div
            className="max-w-2xl mx-auto mt-2 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', border: '0.5px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
          >
            {MENU_ITEMS.map((item, i) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  style={{ borderTop: i > 0 ? '0.5px solid #f3f4f6' : 'none' }}
                >
                  {item.label}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>
                  </svg>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  style={{ borderTop: i > 0 ? '0.5px solid #f3f4f6' : 'none' }}
                >
                  {item.label}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              )
            ))}
          </div>
        )}
      </nav>

      {/* 遮罩：點選關閉 */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
