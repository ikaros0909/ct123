import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

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
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const companyId = searchParams.get('companyId')
      const date = searchParams.get('date')
      
      const where: any = {}
      if (companyId) where.companyId = companyId
      if (date) {
        const koreanDate = toKoreanDate(date)
        if (koreanDate) {
          where.date = koreanDate
        }
      }
      
      const analysisData = await prisma.analysis.findMany({
        where,
        include: {
          company: true
        },
        orderBy: [
          { date: 'desc' },
          { sequenceNumber: 'asc' }
        ]
      })
      
      return NextResponse.json(analysisData)
    } catch (error) {
      console.error('Error fetching analysis data:', error)
      return NextResponse.json(
        { error: '분석 데이터를 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const data = await req.json()
      const { companyId, date, item, scale, modifiedScale, cumulativeScore, weight, index, sequenceNumber, category } = data

      if (!companyId || !date || !item) {
        return NextResponse.json(
          { error: '필수 데이터가 누락되었습니다.' },
          { status: 400 }
        )
      }

      const analysis = await prisma.analysis.create({
        data: {
          companyId,
          date: new Date(date),
          sequenceNumber: sequenceNumber || 0,
          item,
          scale: scale || 0,
          modifiedScale: modifiedScale || 0,
          cumulativeScore: cumulativeScore || 0,
          weight: weight || 0,
          index: index || 0,
          category: category || '',
          userId: req.user?.userId
        },
        include: {
          company: true
        }
      })

      return NextResponse.json({
        message: '분석 데이터가 저장되었습니다.',
        data: analysis
      })
    } catch (error) {
      console.error('Error creating analysis data:', error)
      return NextResponse.json(
        { error: '분석 데이터 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  })
}