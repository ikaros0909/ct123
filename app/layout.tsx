import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { I18nProvider } from './context/I18nProvider'

export const metadata: Metadata = {
  title: 'AI Corporate Competitiveness Diagnosis',
  description: '삼성전자 AI 분석 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
} 