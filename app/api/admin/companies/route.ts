import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

// 테스트 모드용 메모리 저장소
let testCompanies = [
  {
    id: 'test-1',
    name: 'Samsung Electronics',
    nameKr: '삼성전자',
    description: '글로벌 전자 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'test-2',
    name: 'Samsung SDI',
    nameKr: '삼성SDI',
    description: '배터리 및 전자재료 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  }
]

// GET /api/admin/companies - 모든 기업 조회
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  // 테스트 모드로 동작
  try {
    // DB 연결 시도
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const companies = await prisma.company.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        _count: {
          select: {
            analyses: true,
            mainData: true
          }
        }
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    // DB 연결 실패 시 테스트 데이터 반환
    console.log('DB 연결 실패, 테스트 모드로 동작')
    return NextResponse.json(testCompanies)
  }
}

// POST /api/admin/companies - 새 기업 추가
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const { name, nameKr, description } = body

    if (!name) {
      return NextResponse.json(
        { error: '기업명(영문)은 필수입니다' },
        { status: 400 }
      )
    }

    // DB 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const existingCompany = await prisma.company.findUnique({
        where: { name }
      })

      if (existingCompany) {
        return NextResponse.json(
          { error: '이미 존재하는 기업명입니다' },
          { status: 400 }
        )
      }

      // 마지막 order 값 찾기
      const lastCompany = await prisma.company.findFirst({
        orderBy: { order: 'desc' }
      })
      const nextOrder = (lastCompany?.order || 0) + 1

      const company = await prisma.company.create({
        data: {
          name,
          nameKr,
          description,
          order: nextOrder
        }
      })

      return NextResponse.json(company, { status: 201 })
    } catch (dbError) {
      // 테스트 모드로 동작
      console.log('DB 연결 실패, 테스트 모드로 동작')
      
      if (testCompanies.find(c => c.name === name)) {
        return NextResponse.json(
          { error: '이미 존재하는 기업명입니다' },
          { status: 400 }
        )
      }
      
      const newCompany = {
        id: `test-${Date.now()}`,
        name,
        nameKr: nameKr || '',
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { analyses: 0, mainData: 0 }
      }
      
      testCompanies.push(newCompany)
      return NextResponse.json(newCompany, { status: 201 })
    }
  } catch (error) {
    console.error('기업 추가 오류:', error)
    return NextResponse.json(
      { error: '기업 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}