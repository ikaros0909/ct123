import { NextRequest, NextResponse } from 'next/server'

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
  try {
    // 토큰 확인
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 토큰 검증 및 권한 확인
    let userRole: string
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role
    } catch {
      try {
        const { verifyToken } = await import('@/lib/auth')
        const payload = verifyToken(token)
        userRole = payload.role
      } catch {
        return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
      }
    }

    // 관리자 권한 확인
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // DB 연결 시도
    try {
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
    } catch (dbError) {
      // DB 연결 실패 시 테스트 데이터 반환
      console.log('DB 연결 실패, 테스트 모드로 동작')
      return NextResponse.json(testCompanies)
    }
  } catch (error) {
    console.error('기업 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '기업 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/admin/companies - 새 기업 추가
export async function POST(request: NextRequest) {
  try {
    // 토큰 확인
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 토큰 검증 및 권한 확인
    let userRole: string
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      userRole = decoded.role
    } catch {
      try {
        const { verifyToken } = await import('@/lib/auth')
        const payload = verifyToken(token)
        userRole = payload.role
      } catch {
        return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
      }
    }

    // 관리자 권한 확인
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

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