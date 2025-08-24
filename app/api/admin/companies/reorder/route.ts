import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

// PUT /api/admin/companies/reorder - 기업 순서 업데이트
export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const { companies } = await request.json()

    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다' },
        { status: 400 }
      )
    }

    console.log('기업 순서 업데이트 요청:', companies.map((c, i) => ({ id: c.id, name: c.name || c.nameKr, order: i })))
    
    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 트랜잭션으로 모든 기업의 순서 업데이트
      const updates = await prisma.$transaction(
        companies.map((company, index) => {
          console.log(`업데이트: ${company.name || company.nameKr} (${company.id}) -> order: ${index}`)
          return prisma.company.update({
            where: { id: company.id },
            data: { order: index }
          })
        })
      )

      await prisma.$disconnect()
      
      console.log('기업 순서 업데이트 완료:', updates.length, '개 기업')
      return NextResponse.json({ success: true, updated: updates.length })
    } catch (dbError) {
      // 테스트 모드에서는 무시
      console.error('DB 연결 실패 또는 업데이트 오류:', dbError)
      return NextResponse.json({ success: false, error: '데이터베이스 업데이트 실패' }, { status: 500 })
    }
  } catch (error) {
    console.error('기업 순서 업데이트 오류:', error)
    return NextResponse.json(
      { error: '순서 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}