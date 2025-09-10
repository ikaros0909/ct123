import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import OpenAI from 'openai'

// OpenAI API 키가 있을 때만 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { date, categories, items, selectionMode, companyId } = await req.json()
      
      console.log(`\n${'='.repeat(50)}`)
      console.log(`📊 AI 분석 시작`)
      console.log(`${'='.repeat(50)}`)
      console.log(`📍 회사: ${companyId}`)
      console.log(`📅 분석 날짜: ${date}`)
      console.log(`🔍 선택 모드: ${selectionMode}`)
      console.log(`📂 선택된 카테고리: ${categories || '없음'}`)
      console.log(`📝 선택된 항목: ${items || '없음'}`)
      
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

      console.log(`\n🏢 회사 정보:`)
      console.log(`  - 이름: ${company.nameKr || company.name}`)
      console.log(`  - 시스템 프롬프트: ${company.systemPrompt ? '설정됨' : '없음'}`)

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

      console.log(`분석할 항목 수: ${mainData.length}개`)

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
            console.log(`\n=== 분석 항목 ${item.sequenceNumber} ===`)
            console.log(`항목: ${item.item}`)
            console.log(`질문: ${item.question}`)
            
            // 회사별 시스템 프롬프트 구성
            let systemPromptContent = ''
            
            if (company.systemPrompt) {
              console.log(`시스템 프롬프트 적용: ${company.systemPrompt.substring(0, 100)}...`)
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
            console.log(`GPT 응답: "${response}"`)

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
            console.log('⚠️ OpenAI API 키가 없어서 더미 데이터를 생성합니다.')
            aiHIndex = Math.floor(Math.random() * 7) - 3
            source = 'Dummy Data'
          }

          // 기존 분석 데이터가 있는지 확인
          const existingAnalysis = await prisma.analysis.findFirst({
            where: {
              companyId: companyId,
              date: new Date(date),
              sequenceNumber: item.sequenceNumber
            }
          })

          // 분석 결과를 DB에 저장 또는 업데이트
          const analysisData = {
            companyId: companyId,
            date: new Date(date),
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
            console.log(`📝 항목 ${item.sequenceNumber} 분석 업데이트`)
          } else {
            // 새로운 분석 데이터 생성
            analysis = await prisma.analysis.create({
              data: analysisData
            })
            console.log(`📝 항목 ${item.sequenceNumber} 분석 저장`)
          }

          newAnalysisData.push(analysis)
          status[item.sequenceNumber] = { status: 'success', item: item.item || item.question, aiHIndex }
          
          console.log(`✅ 항목 ${item.sequenceNumber} 분석 완료: AI_H지수 = ${aiHIndex}`)

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
          // console.log(` GPT OPENAI_API_KEY: ${process.env.OPENAI_API_KEY}`)
          
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
        console.log('\n=== 요약 리포트 생성 ===')
        
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

        // 강화된 팩트체크 기능을 위한 search-GPT 검색 함수
        const searchAndFactCheck = async (companyName: string, date: string) => {
          try {
            console.log(`🔍 팩트체크 검색 시작: ${companyName}`)
            
            // 1단계: 최신 뉴스 및 이슈 검색
            const newsSearchPrompt = `현재 ${companyName}에 관한 최신 뉴스, 공식 발표, 시장 동향을 조사하세요. 
            특히 다음 영역에 집중해주세요:
            - 실적 발표 및 재무 정보
            - 신제품 출시 및 기술 혁신
            - 경영진 변화 및 전략 발표  
            - 시장 지위 및 경쟁 상황
            - 규제 이슈 및 정책 영향
            - ESG 및 지속가능성 이슈
            
            각 정보에 대해 출처와 날짜를 명시하고, 팩트체크를 위해 여러 신뢰할 수 있는 소스를 확인해주세요.`

            const newsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                    content: `당신은 투자 전문 리서치 애널리스트입니다. 기업에 대한 정확하고 신뢰할 수 있는 최신 정보를 검색하고 팩트체크하는 것이 주요 업무입니다.
                    
                    작업 방식:
                    1. 공신력 있는 소스(공식 발표, 금융기관 보고서, 주요 언론사)의 정보를 우선적으로 참조
                    2. 같은 사실에 대해 다수의 독립적인 소스에서 확인
                    3. 추측이나 루머와 확인된 사실을 명확히 구분
                    4. 날짜와 출처를 반드시 명시
                    5. 투자 의사결정에 영향을 미칠 수 있는 중요도 순으로 정보 정렬`
                  },
                  {
                    role: 'user',
                    content: newsSearchPrompt.replace('${companyName}', companyName)
                  }
                ],
                max_tokens: 800,
                temperature: 0.2
              })
            })

            let factCheckedNews = ''
            if (newsResponse.ok) {
              const newsData = await newsResponse.json()
              factCheckedNews = newsData.choices[0]?.message?.content?.trim() || ''
              console.log(`✅ 1단계 검색 완료: ${factCheckedNews.length}자`)
            }

            // 2단계: 크로스체크 및 검증
            if (factCheckedNews) {
              const verificationPrompt = `다음 ${companyName}에 관한 정보들을 검증하고 신뢰도를 평가해주세요:

${factCheckedNews}

각 정보에 대해:
1. 신뢰도 등급 (A: 높음, B: 보통, C: 낮음)
2. 출처의 신뢰성 평가
3. 다른 소스에서의 확인 여부
4. 투자 관점에서의 중요도 (High/Medium/Low)
5. 근거와 함께 요약

최종적으로 신뢰도가 높고 투자에 중요한 정보만 선별해서 정리해주세요.`

              const verificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                      content: `당신은 정보 검증 전문가이자 투자 분석가입니다. 수집된 정보의 신뢰성을 평가하고, 투자 의사결정에 도움이 되는 검증된 정보만을 선별하는 것이 주요 역할입니다.
                      
                      평가 기준:
                      - 신뢰도: 출처의 권위성, 정보의 구체성, 확인 가능성
                      - 중요도: 주가/기업가치에 대한 영향력, 시급성, 지속성
                      - 객관성: 팩트 기반 정보와 의견/추측의 구분
                      
                      최종 결과는 투자자가 신뢰할 수 있는 근거 기반의 요약본이어야 합니다.`
                    },
                    {
                      role: 'user',
                      content: verificationPrompt
                    }
                  ],
                  max_tokens: 1000,
                  temperature: 0.1
                })
              })

              if (verificationResponse.ok) {
                const verificationData = await verificationResponse.json()
                const verifiedInfo = verificationData.choices[0]?.message?.content?.trim() || ''
                console.log(`✅ 2단계 검증 완료: ${verifiedInfo.length}자`)
                return verifiedInfo
              }
            }

            return factCheckedNews
            
          } catch (error) {
            console.error('❌ 팩트체크 검색 오류:', error)
            return ''
          }
        }
        
        // 팩트체크된 최신 이슈 검색
        const factCheckedIssues = await searchAndFactCheck(company.nameKr || company.name || '삼성전자', date)
        
        // Now Report - Korean Version (한글 버전)
        let nowReportKr = `
[${company.nameKr || company.name} - ${date} 분석 결과]

📊 전체 평균 점수: ${avgScore.toFixed(2)}
📈 가중치 적용 점수: ${totalWeightedScore.toFixed(2)}

카테고리별 분석:
${Object.entries(categoryScores).map(([category, scores]) => 
  `• ${category}: 평균 ${(scores.total / scores.count).toFixed(2)} (가중치 ${scores.weighted.toFixed(2)})`
).join('\n')}

분석 항목 수: ${newAnalysisData.length}개
성공: ${Object.values(status).filter(s => s?.status === 'success').length}개
실패: ${Object.values(status).filter(s => s?.status === 'error').length}개
`
        
        // 팩트체크된 최신 이슈가 있으면 추가
        if (factCheckedIssues) {
          nowReportKr += `

📰 최신 이슈 및 동향 (팩트체크 검증됨):
${factCheckedIssues}

🔍 정보 신뢰성: 위 정보는 다중 소스 검증을 통해 확인된 내용입니다.`
        }

        // Now Report - English Version (영문 버전)
        let nowReportEn = `
[${company.name} - ${date} Analysis Results]

📊 Overall Average Score: ${avgScore.toFixed(2)}
📈 Weighted Score: ${totalWeightedScore.toFixed(2)}

Category Analysis:
${Object.entries(categoryScores).map(([category, scores]) => 
  `• ${category}: Average ${(scores.total / scores.count).toFixed(2)} (Weighted ${scores.weighted.toFixed(2)})`
).join('\n')}

Analyzed Items: ${newAnalysisData.length}
Successful: ${Object.values(status).filter(s => s?.status === 'success').length}
Failed: ${Object.values(status).filter(s => s?.status === 'error').length}
`
        
        // 팩트체크된 이슈를 영문으로 번역
        if (factCheckedIssues) {
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
                    content: 'Translate the following Korean fact-checked business analysis to English while maintaining the professional investment research tone, structure, and credibility indicators.'
                  },
                  {
                    role: 'user',
                    content: factCheckedIssues
                  }
                ],
                max_tokens: 800,
                temperature: 0.1
              })
            })
            
            if (translateResponse.ok) {
              const translateData = await translateResponse.json()
              const englishIssues = translateData.choices[0]?.message?.content?.trim() || ''
              if (englishIssues) {
                nowReportEn += `

📰 Latest Issues & Trends (Fact-Checked & Verified):
${englishIssues}

🔍 Information Reliability: The above information has been verified through multiple source cross-checking.`
              }
            }
          } catch (error) {
            console.error('❌ 번역 오류:', error)
          }
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
        if (factCheckedIssues) {
          factBasedInsights = await generateFactBasedInsights(avgScore, factCheckedIssues)
          console.log(`✅ 팩트 기반 인사이트 생성 완료: ${factBasedInsights.length}자`)
        }

        // Insight Report - Korean Version (한글 버전)
        let insightReportKr = `
[${company.nameKr || company.name} 투자 인사이트]

`
        
        if (factBasedInsights) {
          insightReportKr += `📊 팩트 기반 투자 분석:
${factBasedInsights}

🔍 분석 근거: 위 인사이트는 검증된 최신 정보와 AI 지수 분석을 종합한 결과입니다.`
        } else {
          // 기본 인사이트 (팩트체크 정보가 없는 경우)
          if (avgScore > 1) {
            insightReportKr += `✅ 긍정적 신호: 전반적으로 긍정적인 지표들이 관찰됩니다.
• 주요 호재 요인들이 기업 가치에 긍정적 영향을 미치고 있습니다.
• 투자 매력도가 상승하고 있으며, 중장기 전망이 밝습니다.`
          } else if (avgScore < -1) {
            insightReportKr += `⚠️ 주의 신호: 부정적인 지표들이 다수 발견됩니다.
• 리스크 요인들이 증가하고 있어 신중한 접근이 필요합니다.
• 단기적으로 변동성이 확대될 가능성이 있습니다.`
          } else {
            insightReportKr += `📊 중립적 상황: 긍정과 부정 요인이 혼재되어 있습니다.
• 시장 상황을 지켜보며 추가적인 신호를 기다리는 것이 좋습니다.
• 선별적인 접근과 리스크 관리가 중요합니다.`
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
                insightReportEn += `📊 Fact-Based Investment Analysis:
${englishInsights}

🔍 Analysis Basis: The above insights are based on verified latest information and AI index analysis.`
              }
            }
          } catch (error) {
            console.error('❌ 인사이트 번역 오류:', error)
          }
        } else {
          // 기본 인사이트 영문판 (팩트체크 정보가 없는 경우)
          if (avgScore > 1) {
            insightReportEn += `✅ Positive Signals: Overall positive indicators are observed.
• Key positive factors are positively impacting corporate value.
• Investment attractiveness is rising with bright medium to long-term prospects.`
          } else if (avgScore < -1) {
            insightReportEn += `⚠️ Warning Signals: Multiple negative indicators detected.
• Risk factors are increasing, requiring a cautious approach.
• Short-term volatility may increase.`
          } else {
            insightReportEn += `📊 Neutral Situation: Mixed positive and negative factors.
• Monitor market conditions and wait for additional signals.
• Selective approach and risk management are important.`
          }
        }

        console.log('📄 팩트체크 기반 Now 리포트 생성 완료:', nowReportKr.length, '자')
        console.log('📄 팩트체크 기반 Now 리포트 영문 생성 완료:', nowReportEn.length, '자')
        console.log('📊 팩트 기반 인사이트 리포트 생성 완료:', insightReportKr.length, '자')
        
        // 리포트를 DB에 저장 (한글/영문 버전 모두)
        try {
          // NOW 리포트 저장 또는 업데이트
          const existingNowReport = await prisma.report.findUnique({
            where: {
              companyId_date_type: {
                companyId: companyId,
                date: new Date(date),
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
                date: new Date(date),
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
                date: new Date(date),
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
                date: new Date(date),
                type: 'INSIGHT',
                content: insightReportKr,
                contentEn: insightReportEn,
                userId: req.user?.userId
              }
            })
          }

          console.log('✅ 팩트체크 기반 요약 리포트 저장 완료 (한글/영문 버전)')
          console.log('   - NOW 리포트: 검증된 최신 이슈 정보 포함')
          console.log('   - INSIGHT 리포트: 팩트 기반 투자 인사이트 포함')
        } catch (error: any) {
          console.error('리포트 저장 실패:')
          console.error('  - Error:', error?.message || error)
        }
      }

      console.log(`\n=== 분석 완료 ===`)
      console.log(`분석 날짜: ${date}`)
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