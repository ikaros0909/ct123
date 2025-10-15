import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromHeader, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    try {
      const decoded = verifyToken(token)
      
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
    }

    const settings = await prisma.systemSetting.findFirst({
      where: {
        key: 'OPENAI_API_KEY'
      }
    })

    return NextResponse.json({
      apiKey: settings?.value || ''
    })
  } catch (error) {
    console.error('GPT 설정 조회 오류:', error)
    return NextResponse.json({ error: '설정 조회에 실패했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    try {
      const decoded = verifyToken(token)
      
      if (decoded.role !== 'ADMIN') {
        return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다' }, { status: 400 })
    }

    await prisma.systemSetting.upsert({
      where: {
        key: 'OPENAI_API_KEY'
      },
      update: {
        value: apiKey,
        updatedAt: new Date()
      },
      create: {
        key: 'OPENAI_API_KEY',
        value: apiKey
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GPT 설정 저장 오류:', error)
    return NextResponse.json({ error: '설정 저장에 실패했습니다' }, { status: 500 })
  }
}