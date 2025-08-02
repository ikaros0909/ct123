import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'samsung_analysis.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading samsung_analysis.json:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
} 