import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get('companyId')
    const date = searchParams.get('date')
    const type = searchParams.get('type')

    if (!companyId || !date) {
      return NextResponse.json({ error: 'Company ID and date are required' }, { status: 400 })
    }

    // Build query conditions
    const where: any = {
      companyId,
      date: new Date(date)
    }

    // Add type filter if specified
    if (type) {
      where.type = type
    }

    // Fetch reports from database
    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no reports found, return empty array
    if (!reports || reports.length === 0) {
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

    return NextResponse.json(transformedReports)

  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}