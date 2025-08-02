import React from 'react'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Samsung Analysis Dashboard',
  description: '삼성전자 AI 분석 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
} 