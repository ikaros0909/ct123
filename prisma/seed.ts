import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// 비밀번호 해싱 함수
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Starting seed...')

  try {
    // 관리자 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ct123.kr' }
    })

    if (existingAdmin) {
      console.log('✅ Admin account already exists')
      return
    }

    // 관리자 계정 생성
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!'
    const hashedPassword = hashPassword(adminPassword)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@ct123.kr',
        password: hashedPassword,
        name: 'CT123 Admin',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Admin account created successfully:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Name: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('')
    console.log('⚠️  IMPORTANT: Please change the admin password after first login!')

    // 기본 회사 데이터 생성 (선택적)
    const companies = [
      { 
        name: 'Samsung Electronics', 
        nameKr: '삼성전자',
        description: '글로벌 전자제품 제조 기업',
        order: 1
      },
      { 
        name: 'LG Energy Solution', 
        nameKr: 'LG에너지솔루션',
        description: '배터리 제조 전문 기업',
        order: 2
      },
      { 
        name: 'Hyundai Motor', 
        nameKr: '현대자동차',
        description: '자동차 제조 기업',
        order: 3
      }
    ]

    for (const company of companies) {
      const existing = await prisma.company.findFirst({
        where: { name: company.name }
      })

      if (!existing) {
        await prisma.company.create({
          data: company
        })
        console.log(`✅ Created company: ${company.nameKr}`)
      } else {
        console.log(`   Company already exists: ${company.nameKr}`)
      }
    }

    console.log('')
    console.log('🎉 Seed completed successfully!')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })