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
            source: source,
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
          console.log(` GPT OPENAI_API_KEY: ${process.env.OPENAI_API_KEY}`)
          
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

        // Now Report (현재 상황)
        const nowReport = `
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

        // Insight Report (인사이트)
        let insightReport = `
[${company.nameKr || company.name} 투자 인사이트]

`
        if (avgScore > 1) {
          insightReport += `✅ 긍정적 신호: 전반적으로 긍정적인 지표들이 관찰됩니다.
• 주요 호재 요인들이 기업 가치에 긍정적 영향을 미치고 있습니다.
• 투자 매력도가 상승하고 있으며, 중장기 전망이 밝습니다.`
        } else if (avgScore < -1) {
          insightReport += `⚠️ 주의 신호: 부정적인 지표들이 다수 발견됩니다.
• 리스크 요인들이 증가하고 있어 신중한 접근이 필요합니다.
• 단기적으로 변동성이 확대될 가능성이 있습니다.`
        } else {
          insightReport += `📊 중립적 상황: 긍정과 부정 요인이 혼재되어 있습니다.
• 시장 상황을 지켜보며 추가적인 신호를 기다리는 것이 좋습니다.
• 선별적인 접근과 리스크 관리가 중요합니다.`
        }

        // 리포트를 DB에 저장
        try {
          await prisma.report.create({
            data: {
              companyId: companyId,
              date: new Date(date),
              type: 'NOW',
              content: nowReport,
              userId: req.user?.userId
            }
          })

          await prisma.report.create({
            data: {
              companyId: companyId,
              date: new Date(date),
              type: 'INSIGHT',
              content: insightReport,
              userId: req.user?.userId
            }
          })

          console.log('✅ 요약 리포트 저장 완료')
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