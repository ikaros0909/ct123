// 테스트 모드용 메모리 데이터 저장소

export let testCompanies = [
  {
    id: 'samsung-electronics',
    name: 'Samsung Electronics',
    nameKr: '삼성전자',
    description: '글로벌 전자 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'samsung-biologics',
    name: 'Samsung Biologics',
    nameKr: '삼성바이오로직스',
    description: '바이오의약품 위탁생산(CMO) 전문기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'hyundai-motor',
    name: 'Hyundai Motor',
    nameKr: '현대자동차',
    description: '글로벌 자동차 제조기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'kia-motor',
    name: 'Kia Motor',
    nameKr: '기아자동차',
    description: '글로벌 자동차 제조기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'sk-hynix',
    name: 'SK Hynix',
    nameKr: 'SK하이닉스',
    description: '반도체 메모리 제조기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'lg-energy-solution',
    name: 'LG Energy Solution',
    nameKr: 'LG에너지솔루션',
    description: '배터리 제조 전문기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'hanwha-aerospace',
    name: 'Hanwha Aerospace',
    nameKr: '한화에어로스페이스',
    description: '항공우주 및 방산 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'kb-bank',
    name: 'KB Bank',
    nameKr: 'KB국민은행',
    description: '대한민국 대표 금융기관',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'naver',
    name: 'Naver',
    nameKr: '네이버',
    description: '대한민국 최대 인터넷 포털 및 IT 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  },
  {
    id: 'kakao',
    name: 'Kakao',
    nameKr: '카카오',
    description: '모바일 플랫폼 및 IT 서비스 기업',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { analyses: 0, mainData: 0 }
  }
]

export let testMainData: any[] = []

export let testAnalysisData: any[] = []

// 기업 추가
export function addCompany(company: any) {
  testCompanies.push(company)
  return company
}

// 기업 수정
export function updateCompany(id: string, data: any) {
  const index = testCompanies.findIndex(c => c.id === id)
  if (index !== -1) {
    testCompanies[index] = { ...testCompanies[index], ...data, updatedAt: new Date() }
    return testCompanies[index]
  }
  return null
}

// 기업 삭제
export function deleteCompany(id: string) {
  const index = testCompanies.findIndex(c => c.id === id)
  if (index !== -1) {
    testCompanies.splice(index, 1)
    return true
  }
  return false
}

// 분석항목 추가
export function addMainData(data: any) {
  testMainData.push(data)
  // 관련 기업의 카운트 업데이트
  const company = testCompanies.find(c => c.id === data.companyId)
  if (company && company._count) {
    company._count.mainData++
  }
  return data
}

// 분석항목 수정
export function updateMainData(id: string, data: any) {
  const index = testMainData.findIndex(item => item.id === id)
  if (index !== -1) {
    testMainData[index] = { ...testMainData[index], ...data, updatedAt: new Date() }
    return testMainData[index]
  }
  return null
}

// 분석항목 삭제
export function deleteMainData(id: string) {
  const index = testMainData.findIndex(item => item.id === id)
  if (index !== -1) {
    const item = testMainData[index]
    testMainData.splice(index, 1)
    
    // 관련 기업의 카운트 업데이트
    const company = testCompanies.find(c => c.id === item.companyId)
    if (company && company._count) {
      company._count.mainData--
    }
    return true
  }
  return false
}

// 여러 분석항목 삭제
export function deleteMultipleMainData(ids: string[]) {
  let deletedCount = 0
  ids.forEach(id => {
    if (deleteMainData(id)) {
      deletedCount++
    }
  })
  return deletedCount
}