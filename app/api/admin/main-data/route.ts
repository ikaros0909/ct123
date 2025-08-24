import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { testMainData, testCompanies, addMainData, deleteMultipleMainData } from '@/lib/testDataStore'

// GET /api/admin/main-data - 모든 분석항목 조회
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const field = searchParams.get('field')

    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const where: any = {}
      if (companyId) where.companyId = companyId
      if (category) where.category = category
      if (field) where.field = field

      const mainData = await prisma.mainData.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameKr: true
            }
          }
        },
        orderBy: [
          { companyId: 'asc' },
          { sequenceNumber: 'asc' }
        ]
      })

      return NextResponse.json(mainData)
    } catch (dbError) {
      // 테스트 모드로 동작
      console.log('DB 연결 실패, 테스트 모드로 동작')
      
      let filteredData = [...testMainData]
      
      if (companyId) {
        filteredData = filteredData.filter(item => item.companyId === companyId)
      }
      if (category) {
        filteredData = filteredData.filter(item => item.category === category)
      }
      if (field) {
        filteredData = filteredData.filter(item => item.field === field)
      }
      
      // 정렬
      filteredData.sort((a, b) => {
        if (a.companyId !== b.companyId) {
          return a.companyId.localeCompare(b.companyId)
        }
        return a.sequenceNumber - b.sequenceNumber
      })
      
      return NextResponse.json(filteredData)
    }
  } catch (error) {
    console.error('분석항목 조회 오류:', error)
    return NextResponse.json(
      { error: '분석항목 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/admin/main-data - 새 분석항목 추가
export async function POST(request: NextRequest) {
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

      // 중복 체크 (같은 기업, 같은 연번)
      const existing = await prisma.mainData.findFirst({
        where: {
          companyId,
          sequenceNumber
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: '해당 기업에 이미 같은 연번의 항목이 존재합니다' },
          { status: 400 }
        )
      }

      const mainData = await prisma.mainData.create({
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
          category,
          userId: authResult.userId
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

      return NextResponse.json(mainData, { status: 201 })
    } catch (dbError) {
      // 테스트 모드로 동작
      console.log('DB 연결 실패, 테스트 모드로 동작')
      
      // 테스트 기업 찾기
      const testCompany = testCompanies.find(c => c.id === companyId)
      
      if (!testCompany) {
        return NextResponse.json(
          { error: '존재하지 않는 기업입니다' },
          { status: 400 }
        )
      }
      
      // 중복 체크
      if (testMainData.find(item => item.companyId === companyId && item.sequenceNumber === sequenceNumber)) {
        return NextResponse.json(
          { error: '해당 기업에 이미 같은 연번의 항목이 존재합니다' },
          { status: 400 }
        )
      }
      
      const newMainData = {
        id: `main-${Date.now()}`,
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
        company: {
          id: testCompany.id,
          name: testCompany.name,
          nameKr: testCompany.nameKr
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = addMainData(newMainData)
      return NextResponse.json(result, { status: 201 })
    }
  } catch (error) {
    console.error('분석항목 추가 오류:', error)
    return NextResponse.json(
      { error: '분석항목 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/main-data - 여러 분석항목 일괄 삭제
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 항목을 선택해주세요' },
        { status: 400 }
      )
    }

    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const result = await prisma.mainData.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return NextResponse.json({ 
        message: `${result.count}개의 분석항목이 삭제되었습니다`,
        count: result.count
      })
    } catch (dbError) {
      // 테스트 모드로 동작
      console.log('DB 연결 실패, 테스트 모드로 동작')
      
      const deletedCount = deleteMultipleMainData(ids)
      
      return NextResponse.json({ 
        message: `${deletedCount}개의 분석항목이 삭제되었습니다`,
        count: deletedCount
      })
    }
  } catch (error) {
    console.error('분석항목 삭제 오류:', error)
    return NextResponse.json(
      { error: '분석항목 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}