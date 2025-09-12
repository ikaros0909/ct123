import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 동적 렌더링 강제 (searchParams 사용으로 인한 정적 생성 오류 방지)
export const dynamic = 'force-dynamic'

// 한국 시간으로 날짜 변환 함수
function toKoreanDate(dateString: string): Date | null {
  // 날짜 문자열 유효성 검사
  if (!dateString || dateString === 'Invalid Date') {
    return null
  }
  
  const dateParts = dateString.split('-')
  if (dateParts.length !== 3) {
    return null
  }
  
  const [year, month, day] = dateParts.map(Number)
  
  // 유효한 날짜인지 확인
  if (isNaN(year) || isNaN(month) || isNaN(day) || 
      year < 1900 || year > 2100 || 
      month < 1 || month > 12 || 
      day < 1 || day > 31) {
    return null
  }
  
  // 한국 시간 자정 = UTC 기준 전날 15시 (한국이 UTC+9이므로)
  // 예: 2025-09-11 00:00:00 KST = 2025-09-10 15:00:00 UTC
  const koreanDate = new Date(Date.UTC(year, month - 1, day - 1, 15, 0, 0))
  
  // 생성된 Date 객체가 유효한지 확인
  if (isNaN(koreanDate.getTime())) {
    return null
  }
  
  return koreanDate
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const date = searchParams.get('date')
    const type = searchParams.get('type')

    if (!companyId || !date) {
      return NextResponse.json({ error: 'Company ID and date are required' }, { status: 400 })
    }

    // 날짜 변환
    const koreanDate = toKoreanDate(date)
    if (!koreanDate) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD format.' }, { status: 400 })
    }

    // Build query conditions with Korean timezone
    const where: any = {
      companyId,
      date: koreanDate
    }

    // Add type filter if specified
    if (type) {
      where.type = type
    }

    // Fetch reports from database
    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no reports found, return empty array
    if (!reports || reports.length === 0) {
      return NextResponse.json([])
    }

    // Transform reports to include both language versions
    const transformedReports = reports.map(report => ({
      id: report.id,
      companyId: report.companyId,
      date: report.date,
      type: report.type,
      content: report.content,        // Korean version
      contentEn: report.contentEn,    // English version
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    }))

    return NextResponse.json(transformedReports)

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}