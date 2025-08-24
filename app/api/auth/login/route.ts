import { NextResponse } from 'next/server'
import crypto from 'crypto'

// 임시 테스트용 로그인 (데이터베이스 연결 실패 시 백업)
const TEST_USERS = [
  {
    id: '1',
    email: 'admin@samsung.com',
    password: 'admin123',
    name: 'Admin',
    role: 'ADMIN'
  },
  {
    id: '2',
    email: 'user@samsung.com',
    password: 'user123',
    name: 'User',
    role: 'USER'
  },
  {
    id: '3',
    email: 'admin@ct123.kr',
    password: 'Admin@123!',
    name: 'CT123 Admin',
    role: 'ADMIN'
  }
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데이터베이스 연결 우선 시도
    try {
      const { prisma } = await import('@/lib/prisma')
      const { verifyPassword, generateToken } = await import('@/lib/auth')
      
      const dbUser = await prisma.user.findUnique({
        where: { email }
      })

      if (dbUser) {
        const isValid = await verifyPassword(password, dbUser.password)
        
        if (isValid) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date() }
          })

          const token = generateToken({
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role
          })

          return NextResponse.json({
            message: '로그인에 성공했습니다.',
            token,
            user: {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role
            }
          })
        }
      }
    } catch (dbError) {
      console.log('Database not available, using test mode')
      
      // DB 연결 실패 시 테스트 모드로 폴백
      const user = TEST_USERS.find(u => u.email === email && u.password === password)
      
      if (user) {
        const { generateToken } = await import('@/lib/auth')
        const token = generateToken({
          userId: user.id,
          email: user.email,
          role: user.role as any
        })

        return NextResponse.json({
          message: '로그인에 성공했습니다. (테스트 모드)',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        })
      }
    }

    return NextResponse.json(
      { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}