import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { testMainData, updateMainData, deleteMainData } from '@/lib/testDataStore'

// GET /api/admin/main-data/[id] - 특정 분석항목 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const mainData = await prisma.mainData.findUnique({
        where: { id: params.id },
        include: {
          company: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      })

      if (!mainData) {
        return NextResponse.json(
          { error: '분석항목을 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      return NextResponse.json(mainData)
    } catch (dbError) {
      // 테스트 모드로 동작
      const item = testMainData.find(d => d.id === params.id)
      
      if (!item) {
        return NextResponse.json(
          { error: '분석항목을 찾을 수 없습니다' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(item)
    }
  } catch (error) {
    console.error('분석항목 조회 오류:', error)
    return NextResponse.json(
      { error: '분석항목 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/main-data/[id] - 분석항목 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { 
      companyId, sequenceNumber, item, question, scale, 
      generalRule, modifiedScale, cumulativeScore, weight, 
      index, source, category 
    } = body

    // 필수 필드 검증
    if (!companyId || sequenceNumber === undefined || !item || !question || !category) {
      return NextResponse.json(
        { error: '모든 필수 필드를 입력해주세요' },
        { status: 400 }
      )
    }

    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 기업 존재 확인
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {
        return NextResponse.json(
          { error: '존재하지 않는 기업입니다' },
          { status: 400 }
        )
      }

      // 중복 체크 (같은 기업, 같은 연번 - 자기 자신 제외)
      const existing = await prisma.mainData.findFirst({
        where: {
          companyId,
          sequenceNumber,
          NOT: { id: params.id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: '해당 기업에 이미 같은 연번의 항목이 존재합니다' },
          { status: 400 }
        )
      }

      const mainData = await prisma.mainData.update({
        where: { id: params.id },
        data: {
          companyId,
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
          category
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameKr: true
            }
          }
        }
      })

      return NextResponse.json(mainData)
    } catch (dbError) {
      // 테스트 모드로 동작
      // 중복 체크
      if (testMainData.find(item => 
        item.id !== params.id && 
        item.companyId === companyId && 
        item.sequenceNumber === sequenceNumber
      )) {
        return NextResponse.json(
          { error: '해당 기업에 이미 같은 연번의 항목이 존재합니다' },
          { status: 400 }
        )
      }
      
      const updatedItem = updateMainData(params.id, {
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
        source
      })
      
      if (!updatedItem) {
        return NextResponse.json(
          { error: '분석항목을 찾을 수 없습니다' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(updatedItem)
    }
  } catch (error) {
    console.error('분석항목 수정 오류:', error)
    return NextResponse.json(
      { error: '분석항목 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/main-data/[id] - 분석항목 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const mainData = await prisma.mainData.findUnique({
        where: { id: params.id }
      })

      if (!mainData) {
        return NextResponse.json(
          { error: '분석항목을 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      await prisma.mainData.delete({
        where: { id: params.id }
      })

      return NextResponse.json({ message: '분석항목이 삭제되었습니다' })
    } catch (dbError) {
      // 테스트 모드로 동작
      const deleted = deleteMainData(params.id)
      
      if (!deleted) {
        return NextResponse.json(
          { error: '분석항목을 찾을 수 없습니다' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ message: '분석항목이 삭제되었습니다' })
    }
  } catch (error) {
    console.error('분석항목 삭제 오류:', error)
    return NextResponse.json(
      { error: '분석항목 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}