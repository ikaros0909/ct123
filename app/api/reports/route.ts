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
    // 디버깅을 위한 로그
    console.log('[Reports API] Request received')
    
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const date = searchParams.get('date')
    const type = searchParams.get('type')
    
    console.log('[Reports API] Parameters:', { companyId, date, type })

    if (!companyId) {
      console.error('[Reports API] Missing companyId')
      return NextResponse.json({ 
        error: 'Company ID is required',
        details: 'companyId parameter is missing from the request' 
      }, { status: 400 })
    }

    // date가 없으면 빈 배열 반환 (필수가 아님)
    if (!date) {
      console.log('[Reports API] No date provided, returning empty array')
      return NextResponse.json([])
    }

    // 날짜 변환
    const koreanDate = toKoreanDate(date)
    if (!koreanDate) {
      console.error('[Reports API] Invalid date format:', date)
      return NextResponse.json({ 
        error: 'Invalid date format',
        details: `Date "${date}" is not valid. Use YYYY-MM-DD format.`,
        receivedDate: date
      }, { status: 400 })
    }
    
    console.log('[Reports API] Converted to Korean date:', koreanDate)

    // Build query conditions with Korean timezone
    const where: any = {
      companyId,
      date: koreanDate
    }

    // Add type filter if specified
    if (type) {
      where.type = type
    }

    // 데이터베이스 연결 확인
    try {
      console.log('[Reports API] Checking database connection...')
      await prisma.$connect()
      console.log('[Reports API] Database connected successfully')
    } catch (dbError) {
      console.error('[Reports API] Database connection error:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Cannot connect to database',
        hint: 'Check DATABASE_URL environment variable'
      }, { status: 500 })
    }

    // Fetch reports from database
    console.log('[Reports API] Fetching reports with where clause:', where)
    
    let reports
    try {
      reports = await prisma.report.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      })
      console.log(`[Reports API] Found ${reports?.length || 0} reports`)
    } catch (queryError) {
      console.error('[Reports API] Query error:', queryError)
      return NextResponse.json({ 
        error: 'Database query failed',
        details: queryError instanceof Error ? queryError.message : 'Query execution failed',
        where: where
      }, { status: 500 })
    }

    // If no reports found, return empty array
    if (!reports || reports.length === 0) {
      console.log('[Reports API] No reports found, returning empty array')
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

    console.log('[Reports API] Returning transformed reports')
    return NextResponse.json(transformedReports)

  } catch (error) {
    console.error('[Reports API] Unexpected error:', error)
    
    // 더 자세한 오류 정보 제공
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        type: error.name
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Unknown error occurred',
      details: 'An unexpected error occurred while processing the request'
    }, { status: 500 })
  }
}