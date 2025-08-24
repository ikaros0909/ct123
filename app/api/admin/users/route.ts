import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// 테스트 모드용 사용자 데이터 (데이터베이스 없을 때)
let TEST_USERS = [
  {
    id: '1',
    email: 'admin@samsung.com',
    password: '$2a$10$dummyhash1', // admin123
    name: 'Admin',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-12-24')
  },
  {
    id: '2',
    email: 'user@samsung.com',
    password: '$2a$10$dummyhash2', // user123
    name: 'User',
    role: 'USER',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-12-23')
  },
  {
    id: '3',
    email: 'admin@ct123.kr',
    password: '$2a$10$dummyhash3', // admin123
    name: 'CT123 Admin',
    role: 'ADMIN',
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date('2024-12-24')
  }
]

// GET: 사용자 목록 조회
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

    // 데이터베이스 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLoginAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(users)
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 모드
      console.log('데이터베이스 연결 실패, 테스트 모드로 동작')
      
      // 테스트 사용자 목록 반환 (비밀번호 제외)
      const users = TEST_USERS.map(({ password, ...user }) => user)
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '사용자 목록을 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST: 새 사용자 생성
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

    const { email, password, name, role } = await request.json()

    // 입력 검증
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: '모든 필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 데이터베이스 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 이메일 중복 확인
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다' },
          { status: 400 }
        )
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10)

      // 사용자 생성
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      })

      return NextResponse.json(newUser, { status: 201 })
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 모드
      console.log('데이터베이스 연결 실패, 테스트 모드로 동작')
      
      // 이메일 중복 확인
      if (TEST_USERS.find(u => u.email === email)) {
        return NextResponse.json(
          { error: '이미 사용 중인 이메일입니다' },
          { status: 400 }
        )
      }

      // 테스트 모드에서 새 사용자 추가
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = {
        id: String(Date.now()),
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      TEST_USERS.push(newUser)
      
      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = newUser
      return NextResponse.json(userWithoutPassword, { status: 201 })
    }
  } catch (error) {
    console.error('사용자 생성 오류:', error)
    return NextResponse.json(
      { error: '사용자 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT: 사용자 정보 수정
export async function PUT(request: NextRequest) {
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

    const { id, name, role } = await request.json()

    // 입력 검증
    if (!id || !name || !role) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요' },
        { status: 400 }
      )
    }

    // 데이터베이스 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 사용자 업데이트
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          lastLoginAt: true
        }
      })

      return NextResponse.json(updatedUser)
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 모드
      console.log('데이터베이스 연결 실패, 테스트 모드로 동작')
      
      // 테스트 모드에서 사용자 수정
      const userIndex = TEST_USERS.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
      }

      TEST_USERS[userIndex] = {
        ...TEST_USERS[userIndex],
        name,
        role
      }
      
      const { password, ...userWithoutPassword } = TEST_USERS[userIndex]
      return NextResponse.json(userWithoutPassword)
    }
  } catch (error) {
    console.error('사용자 수정 오류:', error)
    return NextResponse.json(
      { error: '사용자 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE: 사용자 삭제
export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json()

    // 입력 검증
    if (!id) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 데이터베이스 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 사용자 삭제
      await prisma.user.delete({
        where: { id }
      })

      return NextResponse.json({ message: '사용자가 삭제되었습니다' })
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 모드
      console.log('데이터베이스 연결 실패, 테스트 모드로 동작')
      
      // 기본 관리자 계정은 삭제 불가
      const user = TEST_USERS.find(u => u.id === id)
      if (user && user.email === 'admin@ct123.kr') {
        return NextResponse.json(
          { error: '기본 관리자 계정은 삭제할 수 없습니다' },
          { status: 400 }
        )
      }

      // 테스트 모드에서 사용자 삭제
      const userIndex = TEST_USERS.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
      }

      TEST_USERS.splice(userIndex, 1)
      return NextResponse.json({ message: '사용자가 삭제되었습니다' })
    }
  } catch (error) {
    console.error('사용자 삭제 오류:', error)
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}