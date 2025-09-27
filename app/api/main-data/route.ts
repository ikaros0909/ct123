import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// 동적 렌더링 강제 (searchParams 사용으로 인한 정적 생성 오류 방지)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    const where = companyId ? { companyId } : {}

    const mainData = await prisma.mainData.findMany({
      where,
      include: {
        company: true
      },
      orderBy: [
        { category: 'asc' },
        { sequenceNumber: 'asc' }
      ]
    })

    return NextResponse.json(mainData)
  } catch (error) {
    console.error('Error fetching main data:', error)
    return NextResponse.json(
      { error: '데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const data = await req.json()
      const { 
        companyId, category, sequenceNumber, item, question, 
        scale, generalRule, modifiedScale, cumulativeScore, 
        weight, index, source 
      } = data

      if (!companyId || !category || sequenceNumber === undefined || !item || !question) {
        return NextResponse.json(
          { error: '필수 데이터가 누락되었습니다.' },
          { status: 400 }
        )
      }

      const mainData = await prisma.mainData.create({
        data: {
          companyId,
          category,
          sequenceNumber,
          item,
          question,
          scale: scale || 0,
          generalRule: generalRule || '',
          modifiedScale: modifiedScale || 0,
          cumulativeScore: cumulativeScore || 0,
          weight: weight || 0,
          index: index || 0,
          source,
          userId: req.user?.userId
        },
        include: {
          company: true
        }
      })

      return NextResponse.json({
        message: '데이터가 저장되었습니다.',
        data: mainData
      })
    } catch (error) {
      console.error('Error creating main data:', error)
      return NextResponse.json(
        { error: '데이터 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  })
}