import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// 동적 렌더링 강제 (searchParams 사용으로 인한 정적 생성 오류 방지)
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
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
      const category = searchParams.get('category')

      if (!companyId || !category) {
        return NextResponse.json(
          { error: '회사 ID와 카테고리가 필요합니다.' },
          { status: 400 }
        )
      }

      console.log(`\n=== 카테고리 일괄 삭제 ===`)
      console.log(`회사 ID: ${companyId}`)
      console.log(`카테고리: ${category}`)

      // 삭제할 항목 개수 확인
      const itemsToDelete = await prisma.mainData.count({
        where: {
          companyId,
          category
        }
      })

      if (itemsToDelete === 0) {
        return NextResponse.json(
          { error: '해당 카테고리에 삭제할 항목이 없습니다.' },
          { status: 404 }
        )
      }

      console.log(`삭제할 항목 수: ${itemsToDelete}개`)

      // 카테고리별 일괄 삭제
      const result = await prisma.mainData.deleteMany({
        where: {
          companyId,
          category
        }
      })

      console.log(`✅ ${result.count}개 항목 삭제 완료`)
      console.log(`=== 카테고리 일괄 삭제 완료 ===\n`)

      return NextResponse.json({
        success: true,
        message: `${category} 카테고리의 ${result.count}개 항목이 삭제되었습니다.`,
        deletedCount: result.count
      })

    } catch (error: any) {
      console.error('Category deletion error:', error)
      return NextResponse.json(
        { 
          error: '카테고리 삭제 중 오류가 발생했습니다.',
          details: error.message 
        },
        { status: 500 }
      )
    }
  })
}