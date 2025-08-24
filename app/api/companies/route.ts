import { NextRequest, NextResponse } from 'next/server'
import { testCompanies } from '@/lib/testDataStore'

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스에서 기업 목록 가져오기 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          nameKr: true,
          description: true,
          systemPrompt: true,
          createdAt: true,
          _count: {
            select: {
              mainData: true
            }
          }
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      })
      
      await prisma.$disconnect()
      
      // 데이터베이스 형식을 클라이언트 형식으로 변환
      const formattedCompanies = companies.map(company => ({
        id: company.id,
        name: company.name,
        nameKr: company.nameKr,
        description: company.description,
        systemPrompt: company.systemPrompt,
        dataCount: company._count.mainData
      }))
      
      return NextResponse.json(formattedCompanies)
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 데이터 사용
      console.log('Database connection failed, using test data')
      const sortedCompanies = [...testCompanies].sort((a, b) => {
        // createdAt 기준으로 정렬, 없으면 이름으로 정렬
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        return a.name.localeCompare(b.name)
      })
      return NextResponse.json(sortedCompanies)
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: '회사 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST method removed - companies are managed in test data store