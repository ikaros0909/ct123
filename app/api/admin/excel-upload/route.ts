import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // 관리자 권한 확인
      const userRole = req.user?.role
      if (userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const { companyId, items } = await req.json()

      if (!companyId || !items || !Array.isArray(items)) {
        return NextResponse.json(
          { error: '필수 데이터가 누락되었습니다.' },
          { status: 400 }
        )
      }

      console.log(`\n=== 엑셀 업로드 시작 ===`)
      console.log(`회사 ID: ${companyId}`)
      console.log(`업로드 항목 수: ${items.length}개`)

      // 회사 확인
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {
        return NextResponse.json(
          { error: '회사를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      // 기존 데이터는 유지하고 새 데이터 추가 (append mode)
      // 중복 체크를 위해 기존 데이터의 연번 확인
      const existingData = await prisma.mainData.findMany({
        where: { companyId },
        select: { sequenceNumber: true }
      })
      
      const existingNumbers = new Set(existingData.map(d => d.sequenceNumber))
      const duplicateNumbers = items.filter(item => existingNumbers.has(item.sequenceNumber))
      
      if (duplicateNumbers.length > 0) {
        return NextResponse.json(
          { 
            error: `중복된 연번이 있습니다: ${duplicateNumbers.map(d => d.sequenceNumber).join(', ')}`,
            duplicates: duplicateNumbers.map(d => d.sequenceNumber)
          },
          { status: 400 }
        )
      }

      // 데이터 일괄 삽입
      console.log('새 데이터 추가 중...')
      const createData = items.map((item: any) => ({
        companyId,
        sequenceNumber: item.sequenceNumber,
        item: item.item,
        itemEn: item.itemEn || null,
        question: item.question,
        questionEn: item.questionEn || null,
        category: item.category,
        categoryEn: item.categoryEn || null,
        weight: item.weight,
        generalRule: item.generalRule || '',
        generalRuleEn: item.generalRuleEn || null,
        scale: item.scale || 0,
        modifiedScale: item.modifiedScale || item.scale || 0,
        cumulativeScore: item.cumulativeScore || 0,
        index: item.index || 0,
        userId: req.user?.userId
      }))

      // Prisma createMany 사용
      const result = await prisma.mainData.createMany({
        data: createData,
        skipDuplicates: true
      })

      console.log(`✅ ${result.count}개 항목 저장 완료`)
      console.log(`=== 엑셀 업로드 완료 ===\n`)

      // 저장된 데이터 조회
      const savedData = await prisma.mainData.findMany({
        where: { companyId },
        orderBy: [
          { category: 'asc' },
          { sequenceNumber: 'asc' }
        ],
        take: 10 // 응답 크기를 줄이기 위해 처음 10개만 반환
      })

      return NextResponse.json({
        success: true,
        message: `${result.count}개 항목이 성공적으로 업로드되었습니다.`,
        count: result.count,
        preview: savedData
      })

    } catch (error: any) {
      console.error('Excel upload error:', error)
      
      // Prisma 에러 처리
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: '중복된 데이터가 있습니다. 연번을 확인해주세요.' },
          { status: 400 }
        )
      }
      
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: '잘못된 회사 ID입니다.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: '업로드 중 오류가 발생했습니다.',
          details: error.message 
        },
        { status: 500 }
      )
    }
  })
}

// 엑셀 다운로드 (현재 데이터 내보내기)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // 관리자 권한 확인
      const userRole = req.user?.role
      if (userRole !== 'ADMIN') {
        return NextResponse.json(
          { error: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }

      const { searchParams } = new URL(req.url)
      const companyId = searchParams.get('companyId')

      if (!companyId) {
        return NextResponse.json(
          { error: '회사 ID가 필요합니다.' },
          { status: 400 }
        )
      }

      // 데이터 조회
      const mainData = await prisma.mainData.findMany({
        where: { companyId },
        orderBy: [
          { category: 'asc' },
          { sequenceNumber: 'asc' }
        ]
      })

      // 엑셀 형식으로 변환
      const excelData = mainData.map(item => ({
        '연번': item.sequenceNumber,
        '항목': item.item,
        '항목(영문)': item.itemEn || '',
        '질문': item.question,
        '질문(영문)': item.questionEn || '',
        '카테고리': item.category,
        '카테고리(영문)': item.categoryEn || '',
        '가중치': item.weight,
        '일반법칙': item.generalRule || '',
        '일반법칙(영문)': item.generalRuleEn || '',
        '척도': item.scale
      }))

      return NextResponse.json({
        success: true,
        data: excelData,
        count: excelData.length
      })

    } catch (error) {
      console.error('Excel download error:', error)
      return NextResponse.json(
        { error: '다운로드 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
  })
}