'use client'

import React from 'react'

export default function Home() {
  const reports: any[] = []
  
  const nowReport = reports.find(r => r.type === 'NOW')
  const insightReport = reports.find(r => r.type === 'INSIGHT')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1>Test</h1>
        </div>
      </header>
    </div>
  )
}