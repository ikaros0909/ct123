import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// 리포트 상세 조회 (GET /api/admin/reports/[id])
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const reportId = params.id

      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          company: {
            select: {
              name: true,
              nameKr: true
            }
          }
        }
      })

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      return NextResponse.json(report)
    } catch (error: any) {
      console.error('Error fetching report:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch report',
        details: error.message 
      }, { status: 500 })
    }
  })
}

// 리포트 수정 (PUT /api/admin/reports/[id])
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const reportId = params.id
      const { content, contentEn, type } = await request.json()

      // 리포트 존재 여부 확인
      const existingReport = await prisma.report.findUnique({
        where: { id: reportId }
      })

      if (!existingReport) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      // 리포트 업데이트
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          content: content || existingReport.content,
          contentEn: contentEn || existingReport.contentEn,
          type: type || existingReport.type,
          userId: req.user?.userId
        }
      })

      console.log(`✅ 리포트 업데이트 완료: ${reportId} (${updatedReport.type})`)
      return NextResponse.json(updatedReport)
    } catch (error: any) {
      console.error('Error updating report:', error)
      return NextResponse.json({ 
        error: 'Failed to update report',
        details: error.message 
      }, { status: 500 })
    }
  })
}

// 리포트 삭제 (DELETE /api/admin/reports/[id])
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const reportId = params.id

      // 리포트 존재 여부 확인
      const existingReport = await prisma.report.findUnique({
        where: { id: reportId }
      })

      if (!existingReport) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      // 리포트 삭제
      await prisma.report.delete({
        where: { id: reportId }
      })

      console.log(`🗑️ 리포트 삭제 완료: ${reportId} (${existingReport.type})`)
      return NextResponse.json({ message: 'Report deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting report:', error)
      return NextResponse.json({ 
        error: 'Failed to delete report',
        details: error.message 
      }, { status: 500 })
    }
  })
}