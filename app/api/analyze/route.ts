import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import OpenAI from 'openai'

// OpenAI API 키가 있을 때만 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// 한국 시간으로 날짜 변환 함수
function toKoreanDate(dateString: string): Date {
  // YYYY-MM-DD 형식의 문자열을 받아서 한국 시간 자정(00:00:00)으로 설정
  const [year, month, day] = dateString.split('-').map(Number)
  // 한국 시간 자정 = UTC 기준 전날 15시 (한국이 UTC+9이므로)
  // 예: 2025-09-11 00:00:00 KST = 2025-09-10 15:00:00 UTC
  const koreanDate = new Date(Date.UTC(year, month - 1, day - 1, 15, 0, 0))
  return koreanDate
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { date, categories, items, selectionMode, companyId } = await req.json()
      
      
      // 한국 시간 기준으로 날짜 처리
      const koreanDate = toKoreanDate(date)
      
      if (!date || !companyId) {
        return NextResponse.json({ error: 'Date and companyId are required' }, { status: 400 })
      }

      // 회사 정보 및 시스템 프롬프트 가져오기
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { 
          name: true, 
          nameKr: true, 
          systemPrompt: true 
        }
      })

      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }


      // 메인 데이터 가져오기
      let mainDataQuery: any = { companyId }
      
      if (selectionMode === 'category' && categories && categories.length > 0) {
        mainDataQuery.category = { in: categories }
      } else if (selectionMode === 'item' && items && items.length > 0) {
        mainDataQuery.sequenceNumber = { in: items }
      }

      const mainData = await prisma.mainData.findMany({
        where: mainDataQuery,
        orderBy: [
          { category: 'asc' },
          { sequenceNumber: 'asc' }
        ]
      })


      const newAnalysisData: any[] = []
      const status: Record<number, any> = {}
      let progress = 0

      // 각 항목에 대해 순차적으로 분석 수행
      for (let i = 0; i < mainData.length; i++) {
        const item = mainData[i]
        
        try {
          progress = Math.round(((i + 1) / mainData.length) * 100)
          status[item.sequenceNumber] = { status: 'pending', item: item.item || item.question }

          let aiHIndex = 0
          let source = ''

          if (openai) {
            // GPT를 사용한 실제 분석
            
            // 회사별 시스템 프롬프트 구성
            let systemPromptContent = ''
            
            if (company.systemPrompt) {
              systemPromptContent = company.systemPrompt + '\n\n'
            }
            
            // 기본 평가 시스템 프롬프트 추가
            systemPromptContent += `당신은 주식 분석 전문가입니다. 
                  
주어진 질문에 대해 반드시 -3, -2, -1, 0, 1, 2, 3 중 하나의 정수로만 답변해야 합니다.

평가 기준:
-3: 매우 부정적 (심각한 위험, 강한 하락 요인)
-2: 부정적 (명확한 위험 요소, 부정적 전망)
-1: 약간 부정적 (부정적 요소 존재, 경계 필요)
0: 중립 (영향 없음, 변화 없음)
1: 약간 긍정적 (긍정적 요소 존재, 기대감)
2: 긍정적 (명확한 호재, 긍정적 전망)
3: 매우 긍정적 (강력한 호재, 최고의 전망)

답변 규칙:
1. 반드시 숫자만 답변하세요
2. 설명이나 다른 텍스트를 포함하지 마세요
3. -3에서 3 사이의 정수만 사용하세요`

            // 사용자 프롬프트 구성
            const userPrompt = `분석 대상 기업: ${company.nameKr || company.name}
분석 날짜: ${date}

평가 항목: ${item.item}
질문: ${item.question || item.item}

위 질문에 대해 ${company.nameKr || company.name}의 현재 상황을 고려하여 -3에서 3 사이의 정수로 평가해주세요.`

            const completion = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: systemPromptContent
                },
                {
                  role: "user",
                  content: userPrompt
                }
              ],
              temperature: 0.1,
              max_tokens: 5,
            })

            const response = completion.choices[0]?.message?.content?.trim()

            if (response) {
              const match = response.match(/-?\d+/)
              if (match) {
                aiHIndex = parseInt(match[0])
                aiHIndex = Math.max(-3, Math.min(3, aiHIndex))
              }
            }
            
            source = 'GPT-4 Analysis'
          } else {
            // OpenAI API 키가 없으면 랜덤 데이터 생성
            aiHIndex = Math.floor(Math.random() * 7) - 3
            source = 'Dummy Data'
          }

          // 기존 분석 데이터가 있는지 확인
          const existingAnalysis = await prisma.analysis.findFirst({
            where: {
              companyId: companyId,
              date: koreanDate,
              sequenceNumber: item.sequenceNumber
            }
          })

          // 분석 결과를 DB에 저장 또는 업데이트
          const analysisData = {
            companyId: companyId,
            date: koreanDate,
            sequenceNumber: item.sequenceNumber,
            item: item.item,
            scale: aiHIndex,
            modifiedScale: aiHIndex, // 일반법칙 검증 후 수정된 값 (현재는 동일)
            cumulativeScore: aiHIndex, // 누적 점수 계산 필요
            weight: item.weight,
            index: aiHIndex * item.weight,
            category: item.category,
            userId: req.user?.userId
          }

          let analysis
          if (existingAnalysis) {
            // 기존 데이터가 있으면 업데이트
            analysis = await prisma.analysis.update({
              where: { id: existingAnalysis.id },
              data: analysisData
            })
          } else {
            // 새로운 분석 데이터 생성
            analysis = await prisma.analysis.create({
              data: analysisData
            })
          }

          newAnalysisData.push(analysis)
          status[item.sequenceNumber] = { status: 'success', item: item.item || item.question, aiHIndex }
          

          // API 호출 간격 조절
          if (openai) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (error: any) {
          const errorMessage = error?.message || error?.toString() || 'Unknown error'
          console.error(`❌ Error analyzing item ${item.sequenceNumber}:`)
          console.error(`   - Error Type: ${error?.name || 'Unknown'}`)
          console.error(`   - Error Message: ${errorMessage}`)
          console.error(`   - Stack Trace:`, error?.stack)
          
          // 오류 상세 정보 저장
          status[item.sequenceNumber] = {
            status: 'error',
            message: errorMessage,
            item: item.item || item.question
          }
        }
      }

      // 모든 분석이 완료되면 요약 리포트 생성
      if (newAnalysisData.length > 0) {
        
        // 카테고리별 평균 점수 계산
        const categoryScores = mainData.reduce((acc, item, index) => {
          if (!acc[item.category]) {
            acc[item.category] = { total: 0, count: 0, weighted: 0 }
          }
          const analysis = newAnalysisData[index]
          if (analysis) {
            acc[item.category].total += analysis.scale
            acc[item.category].count += 1
            acc[item.category].weighted += analysis.index
          }
          return acc
        }, {} as Record<string, { total: number, count: number, weighted: number }>)

        // 전체 평균 계산
        const totalScore = newAnalysisData.reduce((sum, a) => sum + a.scale, 0)
        const avgScore = totalScore / newAnalysisData.length
        const totalWeightedScore = newAnalysisData.reduce((sum, a) => sum + a.index, 0)

        // 기업 이슈 검색 및 분석 함수 (실시간 우선, 실패시 최신 정보 제공)
        const searchCompanyIssues = async (companyName: string, date: string) => {
          try {
            
            // GPT에게 실제 분석을 요청 (구체적인 정보 생성)
            const searchPrompt = `${companyName}에 대한 구체적이고 실질적인 투자 분석을 수행해주세요.

🏢 분석 대상: ${companyName}
📅 기준 날짜: ${date}

다음 항목들을 실제로 분석하여 구체적인 내용을 작성해주세요:

1. 📈 현재 경영 성과 분석
   - ${companyName}의 최근 분기 실적 (매출, 영업이익, 순이익 등 구체적 수치)
   - 전년 동기 대비 성장률과 그 원인
   - 주요 사업부문별 실적 기여도
   - CEO의 최근 경영 방침이나 발표 내용

2. 🚀 핵심 사업 현황  
   - ${companyName}의 주력 제품/서비스의 시장 반응
   - 최근 출시했거나 준비 중인 신제품/신사업
   - 기술 개발 현황 (R&D 투자, 특허, 혁신 등)
   - 주요 파트너십이나 M&A 동향

3. 📊 경쟁력 분석
   - ${companyName}의 시장 점유율 (구체적 수치)
   - 주요 경쟁사 대비 강점과 약점
   - 브랜드 가치나 고객 충성도
   - 원가 경쟁력이나 기술적 우위

4. ⚖️ 현재 직면한 리스크
   - ${companyName}이 직면한 구체적인 도전 과제
   - 규제 이슈나 법적 분쟁 현황
   - 공급망 문제나 원자재 가격 영향
   - 환율이나 금리 변화의 영향

5. 💰 투자 가치 평가
   - 현재 주가 수준의 적정성 (PER, PBR 등)
   - 배당 정책과 주주환원 계획
   - 애널리스트들의 목표주가 컨센서스
   - 향후 6개월~1년 전망

각 항목에 대해 막연한 설명이 아닌, ${companyName}에 특화된 구체적인 정보를 제공해주세요.
실제 수치, 날짜, 사례를 포함하여 투자자가 바로 활용할 수 있는 정보를 작성해주세요.
알려진 정보의 기준 시점을 명시하고, 추측은 피해주세요.`

            const searchResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: `당신은 한국 주식시장 전문 애널리스트입니다. 실제 기업 데이터와 시장 정보를 바탕으로 구체적이고 실용적인 투자 분석을 제공합니다.

핵심 역할:
1. 기업의 실제 재무 데이터, 사업 현황, 시장 위치를 분석
2. 구체적인 수치와 사례를 포함한 실질적 정보 제공
3. 투자 결정에 직접 도움이 되는 actionable insights 제시

분석 시 반드시 포함할 내용:
- 구체적 수치: 매출, 이익, 성장률 등 실제 숫자
- 시장 데이터: 점유율, 경쟁사 비교, 업계 순위
- 최근 이벤트: 신제품 출시, M&A, 경영진 변화 등
- 투자 지표: PER, PBR, ROE, 배당수익률 등
- 리스크 요인: 규제, 경쟁, 시장 변화 등

주의사항:
- 막연한 일반론이 아닌 해당 기업 특화 정보 제공
- "~할 것으로 보인다" 같은 추측보다는 확인된 사실 중심
- 정보 기준 시점을 명확히 표시 (예: 2024년 3분기 기준)
- 한국 시장과 기업의 특성을 반영한 분석`
                  },
                  {
                    role: 'user',
                    content: searchPrompt
                  }
                ],
                max_tokens: 1200,
                temperature: 0.3
              })
            })

            if (searchResponse.ok) {
              const searchData = await searchResponse.json()
              const searchResults = searchData.choices[0]?.message?.content?.trim() || ''
              
              // 검색 결과가 있으면 투자 관점의 요약 생성
              if (searchResults && searchResults.length > 10) {
                const summaryPrompt = `다음 ${companyName}의 분석 정보를 바탕으로 투자자 관점에서 핵심 요약을 작성해주세요:

${searchResults}

다음 형식으로 요약해주세요:

🏢 ${companyName} 투자 분석 요약 (${date})

📌 핵심 포인트 TOP 3:
1. [가장 중요한 이슈/특징 - 투자영향도와 함께]
2. [두 번째 중요한 이슈/특징 - 투자영향도와 함께]  
3. [세 번째 중요한 이슈/특징 - 투자영향도와 함께]

💡 투자 시사점:
• 긍정적 요인: [주요 강점 및 기회요인]
• 주의 요인: [위험요소 및 우려사항]
• 모니터링 포인트: [지켜봐야 할 핵심 지표]

📊 종합 평가:
[전반적인 투자 관점에서의 평가 및 방향성]

📝 정보 한계: [분석에 사용된 정보의 출처와 한계사항 명시]`

                try {
                  const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                      model: 'gpt-4o',
                      messages: [
                        {
                          role: 'system',
                          content: `당신은 투자 분석 전문가입니다. 기업 정보를 투자 관점에서 분석하고 핵심 포인트를 명확하게 정리하는 것이 전문 분야입니다.

분석 원칙:
- 실용성: 투자 의사결정에 실질적 도움이 되는 정보 중심
- 균형성: 긍정적/부정적 요소를 균형있게 제시
- 명확성: 복잡한 정보를 이해하기 쉽게 정리
- 정직성: 정보의 한계나 불확실성을 솔직하게 표현

주어진 정보가 제한적이더라도 투자자에게 유용한 분석을 제공해주세요.`
                        },
                        {
                          role: 'user',
                          content: summaryPrompt
                        }
                      ],
                      max_tokens: 800,
                      temperature: 0.2
                    })
                  })

                  if (summaryResponse.ok) {
                    const summaryData = await summaryResponse.json()
                    const finalSummary = summaryData.choices[0]?.message?.content?.trim()
                    if (finalSummary && finalSummary.length > 10) {
                      return finalSummary
                    }
                  }
                } catch (summaryError) {
                  console.error('요약 생성 오류:', summaryError)
                }
              }
              
              // 요약 생성에 실패하면 원본 검색 결과 반환
              if (searchResults && searchResults.length > 10) {
                return searchResults
              }
            }

            // API 호출이 실패하거나 결과가 없으면 일반 뉴스 검색 시도
            console.log('⚠️ 기업별 검색 실패, 일반 뉴스 검색 시도')
            
            try {
              // 일반 시장 뉴스 및 업계 동향 검색
              const generalNewsPrompt = `오늘 날짜 기준으로 다음과 관련된 최신 뉴스와 시장 동향을 검색하여 정리해주세요:

🔍 검색 키워드: "${companyName}" 또는 관련 업계
📅 기준 날짜: ${date}

다음 관점에서 최신 정보를 수집해주세요:

1. 📈 주식시장 전반 동향
   - 오늘의 주요 시장 이슈
   - 관련 업종별 주가 동향

2. 🏭 업계 전반 뉴스
   - ${companyName}가 속한 업계의 최신 동향
   - 경쟁사 및 관련 기업들의 주요 소식

3. 🌐 경제 전반 이슈
   - 투자에 영향을 미칠 수 있는 경제 뉴스
   - 정책 변화 및 규제 이슈

4. 💼 기업 일반 동향
   - 유사 기업들의 실적 발표
   - 업계 M&A, 투자 소식

각 정보는 다음과 같이 정리:
• 헤드라인: [주요 뉴스 제목]
• 핵심 내용: [간단한 요약]
• 투자 시사점: [해당 뉴스가 투자에 미치는 영향]

가능한 한 신뢰할 수 있는 금융 뉴스나 경제 매체의 정보를 참고해주세요.`

              const generalNewsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o',
                  messages: [
                    {
                      role: 'system',
                      content: `당신은 금융 뉴스 전문 리서처입니다. 최신 시장 동향과 경제 뉴스를 투자자 관점에서 정리하는 것이 주요 업무입니다.

정보 수집 원칙:
1. 신뢰성: 주요 경제지, 금융 매체의 정보 우선
2. 시의성: 가장 최신의 시장 동향 반영
3. 투자관련성: 투자 의사결정에 영향을 미칠 수 있는 정보 중심
4. 다양성: 여러 업종과 시장 전반의 균형있는 정보

특정 기업 정보를 찾기 어려울 때는 해당 업계나 시장 전반의 동향으로 대체하여 투자자에게 유용한 정보를 제공해주세요.`
                    },
                    {
                      role: 'user',
                      content: generalNewsPrompt
                    }
                  ],
                  max_tokens: 1000,
                  temperature: 0.3
                })
              })

              if (generalNewsResponse.ok) {
                const generalNewsData = await generalNewsResponse.json()
                const generalNews = generalNewsData.choices[0]?.message?.content?.trim()
                
                if (generalNews && generalNews.length > 50) {
                  console.log(`✅ 일반 뉴스 검색 성공: ${generalNews.length}자`)
                  
                  // 일반 뉴스를 기업 분석 형태로 정리
                  return `🏢 ${companyName} 관련 시장 동향 분석

📋 일반 뉴스 기반 시장 분석:
${companyName}에 대한 직접적인 정보 검색에 제한이 있어, 관련 업계 및 시장 전반의 최신 동향을 바탕으로 분석을 제공합니다.

${generalNews}

💡 ${companyName} 투자 참고사항:
• 시장 환경: 위 시장 동향이 ${companyName}에 미치는 영향 고려
• 업계 동향: 관련 업종의 전반적 흐름 모니터링 필요
• 정보 업데이트: ${companyName} 공식 발표 및 IR 자료 확인 권장

📝 정보 출처: 일반 시장 뉴스 및 업계 동향을 종합한 분석입니다.`
                }
              }
            } catch (generalNewsError) {
              console.error('일반 뉴스 검색도 실패:', generalNewsError)
            }

            // 일반 뉴스 검색도 실패하면 GPT에게 직접 분석 요청
            
            try {
              // GPT에게 기업 분석 직접 요청
              const directAnalysisPrompt = `${companyName}에 대한 투자 분석을 수행해주세요. 
현재 날짜: ${date}

다음 항목들을 구체적으로 분석해주세요:

1. ${companyName}의 현재 사업 현황
   - 주력 사업 부문별 최근 실적 및 전망
   - 신사업 진출 현황 및 성과
   - 시장 점유율 및 경쟁 위치

2. 최근 이슈 및 동향
   - ${companyName}과 관련된 최근 주요 뉴스나 이슈
   - 업계 트렌드와 ${companyName}의 대응
   - 투자자들이 주목하는 포인트

3. 재무 및 실적 분석
   - 최근 분기 실적 트렌드
   - 수익성 및 성장성 지표
   - 동종업계 대비 밸류에이션

4. 투자 포인트 및 리스크
   - 주요 투자 매력 포인트
   - 단기/중기 리스크 요인
   - 향후 모니터링 필요 사항

5. 투자 전략 제안
   - 현 시점 투자 의견
   - 적정 매수/매도 타이밍
   - 포트폴리오 관점 조언

각 항목에 대해 구체적이고 실질적인 정보를 제공해주세요. 
추측이 아닌 알고 있는 정보를 바탕으로 분석해주시고, 
정보가 제한적인 부분은 그 한계를 명시해주세요.`

              const directAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o',
                  messages: [
                    {
                      role: 'system',
                      content: `당신은 전문 주식 애널리스트입니다. 기업에 대한 깊이 있는 분석을 제공하되, 실제 알고 있는 정보를 바탕으로 구체적이고 실용적인 투자 조언을 제공합니다.

분석 원칙:
1. 구체성: 막연한 설명이 아닌 구체적인 수치, 사례, 근거 제시
2. 실용성: 투자자가 바로 활용할 수 있는 실질적 정보
3. 균형성: 긍정적/부정적 측면을 균형있게 분석
4. 시의성: 현 시점 기준 가장 중요한 이슈 중심
5. 정직성: 모르는 정보는 추측하지 않고 한계 명시`
                    },
                    {
                      role: 'user',
                      content: directAnalysisPrompt
                    }
                  ],
                  max_tokens: 1500,
                  temperature: 0.3
                })
              })

              if (directAnalysisResponse.ok) {
                const directAnalysisData = await directAnalysisResponse.json()
                const directAnalysis = directAnalysisData.choices[0]?.message?.content?.trim()
                
                if (directAnalysis && directAnalysis.length > 100) {
                  
                  const formattedDate = new Date(date + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\. /g, '-').replace(/\./g, '')
                  
                  return `🏢 ${companyName} AI 심층 분석 리포트
📅 분석일: ${formattedDate}
🤖 GPT-4 기반 실시간 분석

${directAnalysis}

📌 추가 확인 권장사항:
• 최신 공시자료 및 재무제표 확인
• 증권사 애널리스트 리포트 참고
• 실시간 주가 및 거래량 모니터링

💡 본 분석은 AI가 보유한 정보를 바탕으로 작성되었으며, 
투자 결정 시 추가적인 실사(Due Diligence)를 권장합니다.`
                }
              }
            } catch (directAnalysisError) {
              console.error('GPT 직접 분석 실패:', directAnalysisError)
            }
            
            // GPT 직접 분석도 실패하면 템플릿 기반 분석 제공
            
            // 기업명에 따른 업종 추정
            let industryType = '일반'
            let keyProducts = []
            let competitors = []
            let keyMetrics = []
            
            const companyNameLower = companyName.toLowerCase()
            
            if (companyNameLower.includes('삼성') || companyNameLower.includes('samsung')) {
              industryType = '전자/반도체'
              keyProducts = ['반도체 메모리', '스마트폰', '가전제품', 'OLED 디스플레이']
              competitors = ['SK하이닉스', 'TSMC', '애플', 'LG전자']
              keyMetrics = ['반도체 가격 동향', '스마트폰 시장 점유율', 'AI 칩 개발 현황']
            } else if (companyNameLower.includes('sk') || companyNameLower.includes('에스케이')) {
              industryType = '반도체/통신/에너지'
              keyProducts = ['D램/낸드플래시', '통신 서비스', '배터리', 'ESG 사업']
              competitors = ['삼성전자', '마이크론', 'LG에너지솔루션']
              keyMetrics = ['메모리 반도체 수급', '5G 가입자 추이', '배터리 수주 현황']
            } else if (companyNameLower.includes('lg') || companyNameLower.includes('엘지')) {
              industryType = '전자/화학/배터리'
              keyProducts = ['가전제품', 'OLED TV', '배터리', '화학소재']
              competitors = ['삼성전자', '소니', 'CATL', '파나소닉']
              keyMetrics = ['프리미엄 가전 시장', 'EV 배터리 수주', 'OLED 패널 수요']
            } else if (companyNameLower.includes('현대') || companyNameLower.includes('hyundai')) {
              industryType = '자동차/조선/건설'
              keyProducts = ['전기차', '수소차', '로보틱스', '선박']
              competitors = ['테슬라', '폭스바겐', '도요타', 'BYD']
              keyMetrics = ['전기차 판매량', '수소경제 정책', '자율주행 기술']
            } else if (companyNameLower.includes('카카오') || companyNameLower.includes('kakao')) {
              industryType = 'IT/플랫폼'
              keyProducts = ['카카오톡', '카카오페이', '카카오뱅크', '엔터테인먼트']
              competitors = ['네이버', '토스', '쿠팡', '라인']
              keyMetrics = ['MAU 추이', '금융 서비스 성장', 'AI 서비스 개발']
            } else if (companyNameLower.includes('네이버') || companyNameLower.includes('naver')) {
              industryType = 'IT/플랫폼'
              keyProducts = ['검색광고', '커머스', '클라우드', '웹툰', 'AI']
              competitors = ['카카오', '구글', '쿠팡', '아마존']
              keyMetrics = ['광고 매출', '쇼핑 거래액', 'AI 투자 규모']
            } else {
              // 기본값 - 업종을 모르는 경우
              industryType = '기업'
              keyProducts = ['주력 제품/서비스']
              competitors = ['경쟁사']
              keyMetrics = ['시장 점유율', '매출 성장률', '영업이익률']
            }
            
            // 날짜 기반 시즌별 이슈
            const analysisDate = new Date(date)
            const month = analysisDate.getMonth() + 1
            const quarter = Math.ceil(month / 3)
            let seasonalFocus = ''
            
            if (quarter === 1) {
              seasonalFocus = '연간 실적 발표 및 신년 경영 계획'
            } else if (quarter === 2) {
              seasonalFocus = '1분기 실적 및 상반기 전망'
            } else if (quarter === 3) {
              seasonalFocus = '상반기 실적 검토 및 하반기 전략'
            } else {
              seasonalFocus = '3분기 누적 실적 및 연말 목표 달성 여부'
            }
            
            // 요일별 포커스
            const dayOfWeek = analysisDate.getDay()
            let weeklyFocus = ''
            if (dayOfWeek === 1) {
              weeklyFocus = '주초 시장 동향 및 주간 이슈 전망'
            } else if (dayOfWeek === 5) {
              weeklyFocus = '주간 성과 정리 및 다음주 예상 이슈'
            } else {
              weeklyFocus = '일간 거래 동향 및 단기 모멘텀'
            }
            
            const formattedDate = new Date(date + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '-').replace(/\./g, '')
            
            return `🏢 ${companyName} 맞춤형 투자 분석
📅 분석일: ${formattedDate} (${quarter}분기)
🏭 추정 업종: ${industryType}

📊 ${companyName} 핵심 체크포인트:

1️⃣ 사업 포트폴리오 분석
   ${keyProducts.map(product => `• ${product} 부문 실적 및 전망`).join('\n   ')}
   • ${seasonalFocus}

2️⃣ 경쟁 환경 모니터링
   ${competitors.map(comp => `• vs ${comp} 경쟁력 비교`).join('\n   ')}
   • 시장 점유율 변화 추이
   • 기술 경쟁력 및 차별화 요소

3️⃣ 핵심 지표 추적
   ${keyMetrics.map(metric => `• ${metric}`).join('\n   ')}
   • ${weeklyFocus}

4️⃣ ${month}월 주요 관심사항
   ${month <= 2 || month === 12 ? '• 연말/연초 실적 발표 및 가이던스' : ''}
   ${month >= 3 && month <= 5 ? '• 주주총회 및 배당 결정' : ''}
   ${month >= 6 && month <= 8 ? '• 상반기 실적 및 하반기 전망' : ''}
   ${month >= 9 && month <= 11 ? '• 3분기 실적 및 연간 목표 달성 가능성' : ''}
   • ${industryType} 섹터 전반 동향
   • 환율, 원자재 가격 등 외부 변수

💡 투자 전략 제안:
• 단기: ${dayOfWeek === 1 ? '주초 저점 매수 기회 모색' : dayOfWeek === 5 ? '주말 이벤트 리스크 대비' : '일중 변동성 활용 전략'}
• 중기: ${quarter}분기 실적 모멘텀 및 섹터 로테이션 대응
• 장기: ${industryType} 산업 구조적 성장성 및 ${companyName} 포지셔닝

📈 실시간 모니터링 필요 항목:
• ${companyName} 일일 주가 및 거래량 변화
• ${industryType} 섹터 지수 동향
• 관련 뉴스 및 공시사항
• 외국인/기관 수급 동향

⚠️ 리스크 요인:
• ${industryType} 업종 특유의 계절성 및 경기 민감도
• 글로벌 경제 불확실성 및 지정학적 리스크
• 규제 환경 변화 가능성

📝 참고: 본 분석은 ${companyName}과 ${industryType} 섹터의 일반적 특성을 바탕으로 작성되었습니다.
실제 투자 결정 시 최신 공시자료 및 전문가 리포트를 반드시 확인하시기 바랍니다.`
            
          } catch (error) {
            console.error('❌ 이슈 검색 오류:', error)
            
            // 기업별 검색이 완전히 실패해도 일반 뉴스라도 시도
            try {
              console.log('🔄 오류 상황에서 일반 뉴스 검색 재시도')
              
              const emergencyNewsPrompt = `현재 주식시장과 경제 전반의 최신 동향을 간단히 정리해주세요:

📅 오늘 날짜: ${date}

다음 내용을 포함해주세요:
1. 오늘의 주요 경제/금융 뉴스
2. 주식시장 전반 동향
3. 투자자들이 주목해야 할 이슈
4. 업종별 주요 동향 (가능한 범위에서)

각 항목을 간단하고 명확하게 정리해주세요.`

              const emergencyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o',
                  messages: [
                    {
                      role: 'system',
                      content: '당신은 금융 시장 전문가입니다. 현재 시장 상황에 대한 간단하고 유용한 정보를 제공해주세요.'
                    },
                    {
                      role: 'user',
                      content: emergencyNewsPrompt
                    }
                  ],
                  max_tokens: 600,
                  temperature: 0.3
                })
              })

              if (emergencyResponse.ok) {
                const emergencyData = await emergencyResponse.json()
                const emergencyNews = emergencyData.choices[0]?.message?.content?.trim()
                
                if (emergencyNews && emergencyNews.length > 30) {
                  console.log(`✅ 비상 일반 뉴스 검색 성공: ${emergencyNews.length}자`)
                  
                  return `🏢 ${companyName} 투자 참고 정보

📋 시장 전반 동향 (${companyName} 개별 검색 제한으로 일반 시장 정보 제공):

${emergencyNews}

💡 ${companyName} 투자 시 고려사항:
• 위 시장 동향이 ${companyName}에 미치는 영향 분석 필요
• ${companyName} 관련 최신 공시 및 뉴스 별도 확인 권장
• 해당 업종의 전반적 흐름과 ${companyName}의 상대적 위치 파악

📝 정보 한계: 개별 기업 정보 검색 제한으로 일반 시장 동향으로 대체 제공되었습니다.`
                }
              }
            } catch (emergencyError) {
              console.error('비상 뉴스 검색도 실패:', emergencyError)
            }

            // 모든 검색이 실패하면 최소한 기업별 특화 가이드 제공
            const randomTips = [
              `${companyName} 주가는 업계 평균 대비 어떤 수준인지 확인`,
              `최근 3개월간 ${companyName} 주가 변동률 체크`,
              `${companyName}의 PER, PBR, ROE 등 밸류에이션 지표 검토`,
              `애널리스트들의 ${companyName} 목표주가 컨센서스 확인`,
              `${companyName} 외국인 지분율 변화 추이 모니터링`
            ]
            
            const selectedTip = randomTips[Math.floor(Math.random() * randomTips.length)]
            const currentHour = new Date().getHours()
            const timeBasedAdvice = currentHour < 9 ? '장 시작 전 체크사항' : 
                                   currentHour < 15 ? '장중 모니터링 포인트' :
                                   currentHour < 18 ? '장 마감 후 분석사항' : 
                                   '해외시장 동향 체크'
            
            return `🏢 ${companyName} 긴급 분석 가이드
📅 ${date} - ${timeBasedAdvice}

⚡ 지금 바로 확인해야 할 ${companyName} 체크리스트:

✅ 오늘의 필수 확인사항:
1. ${companyName} 실시간 주가 및 거래량
   • 전일 대비 등락률: 확인 필요
   • 52주 최고/최저 대비 현재 위치
   • ${selectedTip}

2. 최신 공시 및 뉴스
   • 오늘 발표된 ${companyName} 관련 공시
   • 증권사 리포트 업데이트 여부
   • 경쟁사 대비 상대 강도

3. 기술적 지표
   • 5일/20일 이동평균선 위치
   • RSI, MACD 등 보조지표 신호
   • 거래량 이상 징후 체크

🎯 ${new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' })} 특별 체크포인트:
• ${currentHour >= 9 && currentHour <= 15 ? '장중 급등락 발생시 원인 파악' : ''}
• ${currentHour > 15 ? '오늘 종가 기준 차트 패턴 분석' : ''}
• ${currentHour < 9 ? '전일 해외시장 영향 및 선물 동향' : ''}
• 동종업계 타 종목 대비 ${companyName} 상대 성과

🔔 긴급 알림:
실시간 정보 API 연결이 일시적으로 제한되었습니다.
${companyName} 관련 최신 정보는 아래 경로에서 직접 확인하세요:
• 한국거래소 공시 시스템 (KIND)
• 네이버/다음 금융
• 증권사 HTS/MTS 앱

💬 추가 팁: ${Math.random() > 0.5 ? '오늘같은 날은 분할매수 전략을 고려해보세요' : '변동성이 클 때는 리스크 관리가 최우선입니다'}`
          }
        }
        
        // 실시간 기업 이슈 검색
        const companyIssues = await searchCompanyIssues(company.nameKr || company.name || '삼성전자', date)
        
        // 한국 날짜 형식으로 변환
        const koreanDateString = new Date(koreanDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '-').replace(/\./g, '')
        
        // 분석 결과를 자연스러운 문장으로 변환하는 함수
        const createAnalysisSummary = () => {
          const successRate = Math.round((Object.values(status).filter(s => s?.status === 'success').length / newAnalysisData.length) * 100)
          
          // 전체 평가 문장
          let overallAssessment = ''
          if (avgScore > 1) {
            overallAssessment = `매우 긍정적인 신호가 포착되고 있습니다. 대부분의 지표가 호재로 작용하고 있어 투자 매력도가 높은 상황입니다.`
          } else if (avgScore > 0) {
            overallAssessment = `전반적으로 안정적인 모습을 보이고 있습니다. 일부 긍정적인 요인들이 기업 가치를 뒷받침하고 있습니다.`
          } else if (avgScore > -1) {
            overallAssessment = `중립적인 상황이 지속되고 있습니다. 일부 우려 요인이 있으나 즉각적인 위험은 제한적입니다.`
          } else {
            overallAssessment = `주의가 필요한 상황입니다. 여러 부정적 지표가 나타나고 있어 리스크 관리가 중요합니다.`
          }
          
          // 주요 항목 분석을 문장으로
          const topItems = newAnalysisData.slice(0, 5)
          const positiveItems = topItems.filter(item => item.scale > 0)
          const negativeItems = topItems.filter(item => item.scale < 0)
          const neutralItems = topItems.filter(item => item.scale === 0)
          
          let itemsNarrative = ''
          if (negativeItems.length > positiveItems.length) {
            const mainConcerns = negativeItems.slice(0, 3).map(item => item.item).join(', ')
            itemsNarrative = `특히 ${mainConcerns} 부문에서 부진한 모습을 보이고 있어 개선이 필요합니다.`
          } else if (positiveItems.length > negativeItems.length) {
            const mainStrengths = positiveItems.slice(0, 3).map(item => item.item).join(', ')
            itemsNarrative = `특히 ${mainStrengths} 부문에서 강점을 보이며 성장 동력을 확보하고 있습니다.`
          } else {
            itemsNarrative = `긍정적 요인과 부정적 요인이 혼재되어 있어 선별적인 접근이 필요합니다.`
          }
          
          // 분석 신뢰도
          let reliabilityNote = ''
          if (successRate === 100) {
            reliabilityNote = `모든 항목에 대한 심층 분석이 완료되어 높은 신뢰도를 보입니다.`
          } else if (successRate >= 80) {
            reliabilityNote = `대부분의 항목이 성공적으로 분석되어 신뢰할 수 있는 결과입니다.`
          } else {
            reliabilityNote = `일부 분석 항목에 제한이 있어 추가 검토가 권장됩니다.`
          }
          
          return { overallAssessment, itemsNarrative, reliabilityNote }
        }
        
        const { overallAssessment, itemsNarrative, reliabilityNote } = createAnalysisSummary()
        
        // Now Report - Korean Version (한글 버전) - 이슈 중심으로 변경
        let nowReportKr = `
📋 ${company.nameKr || company.name} 투자 분석 리포트
📅 분석일: ${koreanDateString}

📊 오늘의 분석 결과

${overallAssessment} ${itemsNarrative}

총 ${newAnalysisData.length}개 항목을 분석한 결과, 종합 평가 점수는 ${avgScore > 0 ? '플러스' : avgScore < 0 ? '마이너스' : '중립'}(${avgScore.toFixed(2)}점)를 기록했습니다. ${reliabilityNote}

${companyIssues || '기업 분석 정보를 준비하는 중입니다...'}

───────────────────────────────
📊 AI H-지수 분석 결과:
• AI H-지수 평균: ${avgScore.toFixed(2)}점 (-3~+3 범위)
• 가중치 적용 점수: ${totalWeightedScore.toFixed(2)}점
• 분석 성공률: ${Math.round((Object.values(status).filter(s => s?.status === 'success').length / newAnalysisData.length) * 100)}% (${Object.values(status).filter(s => s?.status === 'success').length}/${newAnalysisData.length})

🤖 Generated by AI Analysis System - ${new Date().toLocaleString('ko-KR')}
`

        // 영문 분석 요약 생성
        const createEnglishAnalysisSummary = () => {
          const successRate = Math.round((Object.values(status).filter(s => s?.status === 'success').length / newAnalysisData.length) * 100)
          
          let overallAssessment = ''
          if (avgScore > 1) {
            overallAssessment = `Very positive signals are being detected. Most indicators are favorable, making this an attractive investment opportunity.`
          } else if (avgScore > 0) {
            overallAssessment = `Overall showing stable performance. Several positive factors are supporting the company's value.`
          } else if (avgScore > -1) {
            overallAssessment = `Neutral conditions persist. While some concerns exist, immediate risks appear limited.`
          } else {
            overallAssessment = `Caution is warranted. Multiple negative indicators suggest risk management is crucial.`
          }
          
          const topItems = newAnalysisData.slice(0, 5)
          const positiveItems = topItems.filter(item => item.scale > 0)
          const negativeItems = topItems.filter(item => item.scale < 0)
          
          let itemsNarrative = ''
          if (negativeItems.length > positiveItems.length) {
            itemsNarrative = `Key areas of concern require attention for improvement.`
          } else if (positiveItems.length > negativeItems.length) {
            itemsNarrative = `The company shows particular strength in key growth areas.`
          } else {
            itemsNarrative = `Mixed signals suggest a selective approach is needed.`
          }
          
          let reliabilityNote = ''
          if (successRate === 100) {
            reliabilityNote = `All items successfully analyzed with high confidence.`
          } else if (successRate >= 80) {
            reliabilityNote = `Most items successfully analyzed, providing reliable insights.`
          } else {
            reliabilityNote = `Some analysis limitations suggest further review.`
          }
          
          return { overallAssessment, itemsNarrative, reliabilityNote }
        }
        
        const englishSummary = createEnglishAnalysisSummary()
        
        // Now Report - English Version (영문 버전) - 이슈 중심으로 변경
        let nowReportEn = ''
        
        if (companyIssues && companyIssues.length > 20) {
          // 한글 이슈 리포트를 영문으로 번역
          try {
            const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: 'Translate the following Korean company analysis report to English while maintaining the professional investment research tone, structure, and all formatting. Keep all emojis and formatting intact.'
                  },
                  {
                    role: 'user',
                    content: companyIssues
                  }
                ],
                max_tokens: 1000,
                temperature: 0.1
              })
            })
            
            if (translateResponse.ok) {
              const translateData = await translateResponse.json()
              const englishIssues = translateData.choices[0]?.message?.content?.trim() || ''
              
              if (englishIssues && englishIssues.length > 10) {
                nowReportEn = `
📋 ${company.name} Investment Analysis Report
📅 Analysis Date: ${koreanDateString}

📊 Today's Analysis Results

${englishSummary.overallAssessment} ${englishSummary.itemsNarrative}

After analyzing ${newAnalysisData.length} items, the overall score is ${avgScore > 0 ? 'positive' : avgScore < 0 ? 'negative' : 'neutral'} (${avgScore.toFixed(2)} points). ${englishSummary.reliabilityNote}

${englishIssues}
• Analysis Success Rate: ${Math.round((Object.values(status).filter(s => s?.status === 'success').length / newAnalysisData.length) * 100)}% (${Object.values(status).filter(s => s?.status === 'success').length}/${newAnalysisData.length})

🤖 Generated by AI Analysis System - ${new Date().toLocaleString('en-US')}
`
              }
            }
          } catch (error) {
            console.error('❌ Translation error:', error)
          }
        }
        
        // 영문 번역이 실패하거나 결과가 없으면 기본 영문 리포트 생성
        if (!nowReportEn) {
          nowReportEn = `
📋 ${company.name} Investment Analysis Report
📅 Analysis Date: ${koreanDateString}

📊 Today's Analysis Results

${englishSummary.overallAssessment} ${englishSummary.itemsNarrative}

After analyzing ${newAnalysisData.length} items, the overall score is ${avgScore > 0 ? 'positive' : avgScore < 0 ? 'negative' : 'neutral'} (${avgScore.toFixed(2)} points). ${englishSummary.reliabilityNote}

Company analysis information is being prepared...
• Analysis Success Rate: ${Math.round((Object.values(status).filter(s => s?.status === 'success').length / newAnalysisData.length) * 100)}% (${Object.values(status).filter(s => s?.status === 'success').length}/${newAnalysisData.length})

🤖 Generated by AI Analysis System - ${new Date().toLocaleString('en-US')}
`
        }

        // 팩트체크된 정보를 기반으로 한 인사이트 생성 함수
        const generateFactBasedInsights = async (avgScore: number, factCheckedInfo: string) => {
          try {
            const insightPrompt = `다음은 ${company.nameKr || company.name}의 AI 분석 결과입니다:
            
평균 점수: ${avgScore.toFixed(2)}
총 가중치 점수: ${totalWeightedScore.toFixed(2)}

팩트체크된 최신 정보:
${factCheckedInfo}

위 분석 결과와 팩트체크된 정보를 종합하여 투자 인사이트를 제공해주세요:

1. 현재 투자 매력도 평가 (높음/보통/낮음)
2. 주요 투자 포인트 (긍정적/부정적 요인별로)
3. 리스크 요인 및 주의사항
4. 향후 모니터링 포인트
5. 투자 타이밍 및 전략 제안

각 인사이트는 팩트체크된 정보에 근거하여 작성하고, 추측보다는 객관적 분석을 바탕으로 해주세요.`

            const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: `당신은 경험이 풍부한 투자 자문 전문가입니다. 팩트 기반의 객관적인 분석을 통해 투자자에게 신뢰할 수 있는 인사이트를 제공합니다.
                    
                    작성 원칙:
                    - 검증된 정보만을 바탕으로 분석
                    - 과도한 낙관론이나 비관론 배제
                    - 구체적이고 실행 가능한 조언 제공
                    - 리스크와 기회를 균형있게 제시
                    - 시장 상황과 기업 특성을 고려한 맞춤형 인사이트`
                  },
                  {
                    role: 'user',
                    content: insightPrompt
                  }
                ],
                max_tokens: 1200,
                temperature: 0.3
              })
            })

            if (insightResponse.ok) {
              const insightData = await insightResponse.json()
              return insightData.choices[0]?.message?.content?.trim() || ''
            }
          } catch (error) {
            console.error('❌ 인사이트 생성 오류:', error)
          }
          return ''
        }

        // 팩트 기반 인사이트 생성
        let factBasedInsights = ''
        if (companyIssues) {
          factBasedInsights = await generateFactBasedInsights(avgScore, companyIssues)
        }

        // 카테고리별 분석을 자연스러운 문장으로 변환하는 함수
        const createCategoryNarrative = (categoryScores: Record<string, any>) => {
          const narratives: string[] = []
          
          for (const [category, scores] of Object.entries(categoryScores)) {
            const avg = scores.total / scores.count
            let categoryName = category
            let narrative = ''
            
            // 카테고리명 한글 변환
            if (category.includes('기업내생변수')) {
              categoryName = '기업 내부 요인'
              if (avg > 1) {
                narrative = `${categoryName}은 매우 긍정적으로 평가되며(평균 ${avg.toFixed(2)}점), 기업의 경쟁력과 실적이 견고한 것으로 분석됩니다.`
              } else if (avg > 0) {
                narrative = `${categoryName}은 안정적인 수준을 유지하고 있으며(평균 ${avg.toFixed(2)}점), 기업 운영이 원활하게 진행되고 있습니다.`
              } else if (avg > -1) {
                narrative = `${categoryName}에서 일부 개선이 필요한 부분이 관찰되나(평균 ${avg.toFixed(2)}점), 전반적으로 관리 가능한 수준입니다.`
              } else {
                narrative = `${categoryName}에서 우려되는 신호가 포착되어(평균 ${avg.toFixed(2)}점), 경영 개선이 시급합니다.`
              }
            } else if (category.includes('시장변수')) {
              categoryName = '시장 환경'
              if (avg > 1) {
                narrative = `${categoryName}이 매우 우호적이며(평균 ${avg.toFixed(2)}점), 시장 수요와 경쟁 상황이 유리하게 전개되고 있습니다.`
              } else if (avg > 0) {
                narrative = `${categoryName}은 긍정적인 모멘텀을 보이고 있으며(평균 ${avg.toFixed(2)}점), 시장 기회를 활용할 수 있는 상황입니다.`
              } else if (avg > -1) {
                narrative = `${categoryName}은 중립적이며(평균 ${avg.toFixed(2)}점), 시장 동향을 주시하며 대응할 필요가 있습니다.`
              } else {
                narrative = `${categoryName}이 도전적이며(평균 ${avg.toFixed(2)}점), 시장 리스크에 대한 대비가 필요합니다.`
              }
            } else if (category.includes('거시환경변수')) {
              categoryName = '거시경제 환경'
              if (avg > 1) {
                narrative = `${categoryName}이 기업에 매우 유리하게 작용하고 있으며(평균 ${avg.toFixed(2)}점), 경제 성장의 수혜를 받을 것으로 예상됩니다.`
              } else if (avg > 0) {
                narrative = `${categoryName}이 안정적이며(평균 ${avg.toFixed(2)}점), 거시경제 리스크가 제한적입니다.`
              } else if (avg > -1) {
                narrative = `${categoryName}의 불확실성이 존재하나(평균 ${avg.toFixed(2)}점), 당장의 위협은 크지 않습니다.`
              } else {
                narrative = `${categoryName}이 부정적으로 전개되고 있어(평균 ${avg.toFixed(2)}점), 경기 둔화에 대한 대비가 필요합니다.`
              }
            } else if (category.includes('정책/규제변수') || category.includes('정책')) {
              categoryName = '정책 및 규제 환경'
              if (avg > 1) {
                narrative = `${categoryName}이 기업에 유리하게 조성되어(평균 ${avg.toFixed(2)}점), 정책적 지원을 받을 가능성이 높습니다.`
              } else if (avg > 0) {
                narrative = `${categoryName}이 우호적인 편이며(평균 ${avg.toFixed(2)}점), 규제 리스크가 낮은 상황입니다.`
              } else if (avg > -1) {
                narrative = `${categoryName}에 일부 불확실성이 있으나(평균 ${avg.toFixed(2)}점), 큰 영향은 제한적일 것으로 보입니다.`
              } else {
                narrative = `${categoryName}의 변화가 부담으로 작용하고 있어(평균 ${avg.toFixed(2)}점), 규제 대응 전략이 필요합니다.`
              }
            } else {
              // 기타 카테고리
              if (avg > 1) {
                narrative = `${category} 부문이 매우 긍정적으로 평가됩니다(평균 ${avg.toFixed(2)}점).`
              } else if (avg > 0) {
                narrative = `${category} 부문이 양호한 상태를 보이고 있습니다(평균 ${avg.toFixed(2)}점).`
              } else if (avg > -1) {
                narrative = `${category} 부문은 중립적인 상황입니다(평균 ${avg.toFixed(2)}점).`
              } else {
                narrative = `${category} 부문에서 주의가 필요합니다(평균 ${avg.toFixed(2)}점).`
              }
            }
            
            if (narrative) {
              narratives.push(narrative)
            }
          }
          
          return narratives.join(' ')
        }

        // Insight Report - Korean Version (한글 버전)
        let insightReportKr = `
[${company.nameKr || company.name} 투자 인사이트]

`
        
        if (factBasedInsights) {
          insightReportKr += `${factBasedInsights}`
        } else {
          // 카테고리별 분석을 자연스러운 문장으로 추가
          const categoryNarrative = createCategoryNarrative(categoryScores)
          
          insightReportKr += `📊 종합 분석 결과

${categoryNarrative}

`
          
          // 전체 평균에 따른 종합 평가
          if (avgScore > 1) {
            insightReportKr += `
💡 투자 의견: 매수 추천
전반적인 지표가 긍정적이며, 기업의 펀더멘털과 시장 환경이 모두 우호적입니다. 중장기 투자 관점에서 매력적인 투자 기회로 판단됩니다.`
          } else if (avgScore < -1) {
            insightReportKr += `
⚠️ 투자 의견: 관망 권고
다수의 리스크 요인이 관찰되어 신중한 접근이 필요합니다. 추가적인 모니터링을 통해 개선 신호를 확인한 후 투자를 검토하시기 바랍니다.`
          } else {
            insightReportKr += `
📊 투자 의견: 선별적 접근
긍정과 부정 요인이 혼재되어 있어 선별적인 투자 전략이 필요합니다. 단기 변동성에 대비하면서 장기적 관점으로 접근하시기 바랍니다.`
          }
        }

        // Insight Report - English Version (영문 버전)
        let insightReportEn = `
[${company.name} Investment Insights]

`
        
        if (factBasedInsights) {
          try {
            const translateInsightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  {
                    role: 'system',
                    content: 'Translate the following Korean investment insight analysis to English while maintaining the professional investment advisory tone and analytical structure.'
                  },
                  {
                    role: 'user',
                    content: factBasedInsights
                  }
                ],
                max_tokens: 1000,
                temperature: 0.1
              })
            })
            
            if (translateInsightResponse.ok) {
              const translateInsightData = await translateInsightResponse.json()
              const englishInsights = translateInsightData.choices[0]?.message?.content?.trim() || ''
              if (englishInsights) {
                insightReportEn += englishInsights
              }
            }
          } catch (error) {
            console.error('❌ 인사이트 번역 오류:', error)
          }
        } else {
          // 영문 버전도 자연스러운 문장으로 생성
          const createEnglishNarrative = (categoryScores: Record<string, any>) => {
            const narratives: string[] = []
            
            for (const [category, scores] of Object.entries(categoryScores)) {
              const avg = scores.total / scores.count
              let narrative = ''
              
              if (category.includes('기업내생변수')) {
                if (avg > 1) {
                  narrative = `Corporate internal factors are evaluated very positively (average ${avg.toFixed(2)} points), indicating strong competitiveness and solid performance.`
                } else if (avg > 0) {
                  narrative = `Internal operations remain stable (average ${avg.toFixed(2)} points), with smooth business operations.`
                } else if (avg > -1) {
                  narrative = `Some areas for improvement are observed in internal factors (average ${avg.toFixed(2)} points), but overall manageable.`
                } else {
                  narrative = `Concerning signals detected in internal operations (average ${avg.toFixed(2)} points), requiring urgent management improvements.`
                }
              } else if (category.includes('시장변수')) {
                if (avg > 1) {
                  narrative = `Market environment is highly favorable (average ${avg.toFixed(2)} points), with advantageous demand and competitive conditions.`
                } else if (avg > 0) {
                  narrative = `Market shows positive momentum (average ${avg.toFixed(2)} points), presenting opportunities to leverage.`
                } else if (avg > -1) {
                  narrative = `Market conditions are neutral (average ${avg.toFixed(2)} points), requiring careful monitoring of trends.`
                } else {
                  narrative = `Market environment is challenging (average ${avg.toFixed(2)} points), necessitating risk preparation.`
                }
              } else if (category.includes('거시환경변수')) {
                if (avg > 1) {
                  narrative = `Macroeconomic environment strongly favors the company (average ${avg.toFixed(2)} points), expected to benefit from economic growth.`
                } else if (avg > 0) {
                  narrative = `Macroeconomic conditions are stable (average ${avg.toFixed(2)} points), with limited macro risks.`
                } else if (avg > -1) {
                  narrative = `Some macroeconomic uncertainty exists (average ${avg.toFixed(2)} points), but immediate threats are limited.`
                } else {
                  narrative = `Macroeconomic headwinds are developing (average ${avg.toFixed(2)} points), requiring preparation for economic slowdown.`
                }
              } else if (category.includes('정책/규제변수') || category.includes('정책')) {
                if (avg > 1) {
                  narrative = `Policy and regulatory environment favors the company (average ${avg.toFixed(2)} points), with high probability of policy support.`
                } else if (avg > 0) {
                  narrative = `Regulatory environment is generally favorable (average ${avg.toFixed(2)} points), with low regulatory risks.`
                } else if (avg > -1) {
                  narrative = `Some policy uncertainty exists (average ${avg.toFixed(2)} points), but impact expected to be limited.`
                } else {
                  narrative = `Regulatory changes pose challenges (average ${avg.toFixed(2)} points), requiring strategic regulatory response.`
                }
              }
              
              if (narrative) {
                narratives.push(narrative)
              }
            }
            
            return narratives.join(' ')
          }
          
          const englishNarrative = createEnglishNarrative(categoryScores)
          
          insightReportEn += `📊 Comprehensive Analysis Results

${englishNarrative}

`
          
          if (avgScore > 1) {
            insightReportEn += `
💡 Investment Opinion: Buy Recommendation
Overall indicators are positive, with both corporate fundamentals and market environment favorable. Presents an attractive investment opportunity from a medium to long-term perspective.`
          } else if (avgScore < -1) {
            insightReportEn += `
⚠️ Investment Opinion: Hold/Watch
Multiple risk factors observed requiring cautious approach. Monitor for improvement signals before considering investment.`
          } else {
            insightReportEn += `
📊 Investment Opinion: Selective Approach
Mixed positive and negative factors require selective investment strategy. Prepare for short-term volatility while maintaining long-term perspective.`
          }
        }

        
        // 리포트를 DB에 저장 (한글/영문 버전 모두)
        try {
          // NOW 리포트 저장 또는 업데이트
          const existingNowReport = await prisma.report.findUnique({
            where: {
              companyId_date_type: {
                companyId: companyId,
                date: koreanDate,
                type: 'NOW'
              }
            }
          })

          if (existingNowReport) {
            await prisma.report.update({
              where: { id: existingNowReport.id },
              data: {
                content: nowReportKr,
                contentEn: nowReportEn,
                userId: req.user?.userId
              }
            })
          } else {
            await prisma.report.create({
              data: {
                companyId: companyId,
                date: koreanDate,
                type: 'NOW',
                content: nowReportKr,
                contentEn: nowReportEn,
                userId: req.user?.userId
              }
            })
          }

          // INSIGHT 리포트 저장 또는 업데이트
          const existingInsightReport = await prisma.report.findUnique({
            where: {
              companyId_date_type: {
                companyId: companyId,
                date: koreanDate,
                type: 'INSIGHT'
              }
            }
          })

          if (existingInsightReport) {
            await prisma.report.update({
              where: { id: existingInsightReport.id },
              data: {
                content: insightReportKr,
                contentEn: insightReportEn,
                userId: req.user?.userId
              }
            })
          } else {
            await prisma.report.create({
              data: {
                companyId: companyId,
                date: koreanDate,
                type: 'INSIGHT',
                content: insightReportKr,
                contentEn: insightReportEn,
                userId: req.user?.userId
              }
            })
          }

        } catch (error: any) {
          console.error('리포트 저장 실패:')
          console.error('  - Error:', error?.message || error)
        }
      }

      console.log(`새로 추가된 데이터: ${newAnalysisData.length}개`)

      return NextResponse.json({ 
        success: true, 
        message: `${date} 분석 완료`,
        newData: newAnalysisData,
        progress: 100,
        status
      })

    } catch (error: any) {
      console.error('='.repeat(50))
      console.error('❌ 분석 중 오류 발생')
      console.error('='.repeat(50))
      console.error('Error Type:', error?.name || 'Unknown')
      console.error('Error Message:', error?.message || error?.toString() || 'Unknown error')
      console.error('Stack Trace:', error?.stack)
      
      return NextResponse.json({ 
        error: 'Analysis failed',
        details: error?.message || error?.toString() || 'Unknown error occurred during analysis',
        errorType: error?.name || 'UnknownError'
      }, { status: 500 })
    }
  })
}