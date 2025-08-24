import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }
    
    // 테스트 모드 토큰 처리
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // 토큰 만료 확인
      if (decoded.exp && decoded.exp < Date.now()) {
        return NextResponse.json(
          { error: '토큰이 만료되었습니다' },
          { status: 401 }
        )
      }
      
      // 테스트 모드 응답
      if (decoded.userId && decoded.email && decoded.role) {
        return NextResponse.json({
          id: decoded.userId,
          email: decoded.email,
          name: decoded.email.split('@')[0],
          role: decoded.role
        })
      }
    } catch (e) {
      // 실제 JWT 토큰 처리 시도
      try {
        const { verifyToken } = await import('@/lib/auth')
        const payload = verifyToken(token)
        
        // DB 연결 시도
        try {
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()
          
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
              lastLoginAt: true
            }
          })
          
          if (user) {
            return NextResponse.json(user)
          }
        } catch (dbError) {
          // DB 연결 실패 시 토큰 정보로 응답
          return NextResponse.json({
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            name: payload.email.split('@')[0]
          })
        }
      } catch (jwtError) {
        // JWT 검증 실패
      }
    }
    
    return NextResponse.json(
      { error: '유효하지 않은 토큰입니다' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: '인증 실패' },
      { status: 401 }
    )
  }
}