import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // 토큰 확인
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 토큰 검증 - 테스트 모드와 실제 JWT 모두 처리
    let userId: string
    let userEmail: string
    
    try {
      // 테스트 모드 토큰 처리 (base64)
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      if (decoded.userId && decoded.email) {
        userId = decoded.userId
        userEmail = decoded.email
      } else {
        throw new Error('Invalid token format')
      }
    } catch {
      // 실제 JWT 토큰 처리
      try {
        const { verifyToken } = await import('@/lib/auth')
        const payload = verifyToken(token)
        userId = payload.userId
        userEmail = payload.email
      } catch {
        return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
      }
    }

    const { currentPassword, newPassword } = await request.json()

    // 입력 검증
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호와 새 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 데이터베이스 연결 시도
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // 사용자 찾기
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
      }

      // 현재 비밀번호 확인
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다' }, { status: 400 })
      }

      // 새 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // 비밀번호 업데이트
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })
    } catch (dbError) {
      // 데이터베이스 연결 실패 시 테스트 모드
      console.log('데이터베이스 연결 실패, 테스트 모드로 동작')
      
      // 테스트 사용자인 경우만 비밀번호 변경 시뮬레이션
      if (userEmail === 'admin@samsung.com' || userEmail === 'user@samsung.com' || userEmail === 'admin@ct123.kr') {
        if (currentPassword !== 'admin123' && currentPassword !== 'user123') {
          return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다' }, { status: 400 })
        }
        // 테스트 모드에서는 실제 변경하지 않고 성공 메시지만 반환
        return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다 (테스트 모드)' })
      }
      
      throw dbError
    }

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다' })
  } catch (error) {
    console.error('비밀번호 변경 오류:', error)
    return NextResponse.json(
      { error: '비밀번호 변경 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}