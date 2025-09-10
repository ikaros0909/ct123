'use client'

import React from 'react'

export default function Test() {
  const data: any[] = []
  const transformed = data.map((item: any) => ({
    id: item.id,
    name: item.name
  }))
  
  const report = data.find(r => r.type === 'TEST')
  
  return (
    <div>Test</div>
  )
}