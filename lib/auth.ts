import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function requireAdmin(request: NextRequest): Promise<TokenPayload | Response> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return new Response(JSON.stringify({ error: '인증이 필요합니다' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  // JWT 토큰 검증
  try {
    const payload = verifyToken(token)
    
    if (payload.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}