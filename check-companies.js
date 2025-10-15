const { PrismaClient } = require('@prisma/client')

async function checkCompanies() {
  const prisma = new PrismaClient()

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        nameKr: true,
        order: true,
        createdAt: true,
        _count: {
          select: {
            mainData: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    console.log(`총 ${companies.length}개 기업 발견:`)
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.nameKr || company.name} (${company.name})`)
      console.log(`   - ID: ${company.id}`)
      console.log(`   - Order: ${company.order}`)
      console.log(`   - Data Count: ${company._count.mainData}`)
      console.log(`   - Created: ${company.createdAt}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCompanies()
