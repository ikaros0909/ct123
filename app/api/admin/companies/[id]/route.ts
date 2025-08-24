import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/companies/[id] - 특정 기업 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        analyses: {
          orderBy: { date: 'desc' },
          take: 10
        },
        mainData: {
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: '기업을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('기업 조회 오류:', error)
    return NextResponse.json(
      { error: '기업 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/companies/[id] - 기업 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, nameKr, description, systemPrompt } = body

    if (!name) {
      return NextResponse.json(
        { error: '기업명(영문)은 필수입니다' },
        { status: 400 }
      )
    }

    // 다른 기업이 같은 이름을 사용하는지 확인
    const existingCompany = await prisma.company.findFirst({
      where: {
        name,
        NOT: { id: params.id }
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: '이미 사용 중인 기업명입니다' },
        { status: 400 }
      )
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        nameKr,
        description,
        systemPrompt
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('기업 수정 오류:', error)
    return NextResponse.json(
      { error: '기업 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/companies/[id] - 기업 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // 관련 데이터가 있는지 확인
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            analyses: true,
            mainData: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: '기업을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (company._count.analyses > 0 || company._count.mainData > 0) {
      return NextResponse.json(
        { error: '관련 데이터가 있는 기업은 삭제할 수 없습니다. 먼저 관련 데이터를 삭제해주세요.' },
        { status: 400 }
      )
    }

    await prisma.company.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '기업이 삭제되었습니다' })
  } catch (error) {
    console.error('기업 삭제 오류:', error)
    return NextResponse.json(
      { error: '기업 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}