import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// 동적 렌더링 강제 (searchParams 사용으로 인한 정적 생성 오류 방지)
export const dynamic = 'force-dynamic'

// 전체 리포트 목록 조회 (GET /api/admin/reports)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const companyId = searchParams.get('companyId')
      const type = searchParams.get('type') // 'NOW', 'INSIGHT', or null for all
      const date = searchParams.get('date')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const offset = (page - 1) * limit

      // 조건 구성
      const where: any = {}
      
      if (companyId) {
        where.companyId = companyId
      }
      
      if (type && ['NOW', 'INSIGHT'].includes(type)) {
        where.type = type
      }
      
      if (date) {
        where.date = new Date(date)
      }

      // 리포트 목록 조회
      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            company: {
              select: {
                name: true,
                nameKr: true
              }
            }
          },
          orderBy: [
            { date: 'desc' },
            { createdAt: 'desc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.report.count({ where })
      ])

      return NextResponse.json({
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error: any) {
      console.error('Error fetching admin reports:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch reports',
        details: error.message 
      }, { status: 500 })
    }
  })
}

// 새 리포트 생성 (POST /api/admin/reports)
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { companyId, date, type, content, contentEn } = await request.json()

      // 필수 필드 검증
      if (!companyId || !date || !type || !content) {
        return NextResponse.json({ 
          error: 'Missing required fields: companyId, date, type, content' 
        }, { status: 400 })
      }

      if (!['NOW', 'INSIGHT'].includes(type)) {
        return NextResponse.json({ 
          error: 'Invalid type. Must be NOW or INSIGHT' 
        }, { status: 400 })
      }

      // 기업 존재 여부 확인
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })

      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }

      // 동일한 날짜/타입의 리포트가 있는지 확인
      const existingReport = await prisma.report.findUnique({
        where: {
          companyId_date_type: {
            companyId,
            date: new Date(date),
            type
          }
        }
      })

      if (existingReport) {
        return NextResponse.json({ 
          error: 'Report with same company, date, and type already exists',
          existingReportId: existingReport.id
        }, { status: 409 })
      }

      // 새 리포트 생성
      const newReport = await prisma.report.create({
        data: {
          companyId,
          date: new Date(date),
          type,
          content,
          contentEn,
          userId: req.user?.userId
        }
      })

      console.log(`✅ 새 리포트 생성: ${newReport.id} (${type})`)
      return NextResponse.json(newReport, { status: 201 })
    } catch (error: any) {
      console.error('Error creating report:', error)
      return NextResponse.json({ 
        error: 'Failed to create report',
        details: error.message 
      }, { status: 500 })
    }
  })
}