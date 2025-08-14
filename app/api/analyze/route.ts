import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

// OpenAI API 키가 있을 때만 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

interface SamsungMainData {
  구분: string
  연번: number
  AI_H지수_프롬프터: string
  가중치: number
  분야: string
}

interface SamsungAnalysisData {
  날짜: string
  AI_H지수: number
  지수X가중치: number
  구분?: string
  연번?: number
  분야?: string
}

export async function POST(request: Request) {
  try {
    const { date, categories, items, selectionMode } = await request.json()
    
    console.log(`\n=== 분석 시작 ===`)
    console.log(`요청 날짜: ${date}`)
    console.log(`선택 모드: ${selectionMode}`)
    console.log(`선택된 카테고리: ${categories}`)
    console.log(`선택된 항목: ${items}`)
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // OpenAI API 키가 없으면 더미 데이터 반환
    if (!openai) {
      console.log('⚠️ OpenAI API 키가 없어서 더미 데이터를 생성합니다.')
      
      // samsung_main.json 읽기
      const mainFilePath = path.join(process.cwd(), 'data', 'samsung_main.json')
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8')
      const mainData: SamsungMainData[] = JSON.parse(mainFileContent)

      // samsung_analysis.json 읽기
      const analysisFilePath = path.join(process.cwd(), 'data', 'samsung_analysis.json')
      const analysisFileContent = fs.readFileSync(analysisFilePath, 'utf8')
      const analysisData: SamsungAnalysisData[] = JSON.parse(analysisFileContent)

      // 선택 모드에 따라 필터링
      let filteredData: SamsungMainData[] = []
      
      if (selectionMode === 'category' && categories && categories.length > 0) {
        filteredData = mainData.filter(item => categories.includes(item.구분))
      } else if (selectionMode === 'item' && items && items.length > 0) {
        filteredData = mainData.filter(item => items.includes(item.연번))
      } else {
        filteredData = mainData
      }

      const newAnalysisData: SamsungAnalysisData[] = []
      const status: Record<number, 'pending' | 'success' | 'error'> = {}

      // 더미 데이터 생성
      for (let i = 0; i < filteredData.length; i++) {
        const item = filteredData[i]
        
        // 랜덤한 AI_H지수 생성 (-3에서 3 사이)
        const aiHIndex = Math.floor(Math.random() * 7) - 3
        
        newAnalysisData.push({
          날짜: date,
          AI_H지수: aiHIndex,
          지수X가중치: aiHIndex * item.가중치,
          구분: item.구분,
          연번: item.연번,
          분야: item.분야
        })
        
        status[item.연번] = 'success'
      }

      // 기존 데이터에 새 데이터 추가
      const updatedAnalysisData = [...analysisData, ...newAnalysisData]
      fs.writeFileSync(analysisFilePath, JSON.stringify(updatedAnalysisData, null, 2))

      return NextResponse.json({ 
        success: true, 
        message: `${date} 더미 분석 완료 (OpenAI API 키 없음)`,
        newData: newAnalysisData,
        progress: 100,
        status
      })
    }

    // samsung_main.json 읽기
    const mainFilePath = path.join(process.cwd(), 'data', 'samsung_main.json')
    const mainFileContent = fs.readFileSync(mainFilePath, 'utf8')
    const mainData: SamsungMainData[] = JSON.parse(mainFileContent)

    // samsung_analysis.json 읽기
    const analysisFilePath = path.join(process.cwd(), 'data', 'samsung_analysis.json')
    const analysisFileContent = fs.readFileSync(analysisFilePath, 'utf8')
    const analysisData: SamsungAnalysisData[] = JSON.parse(analysisFileContent)

    console.log(`기존 분석 데이터 수: ${analysisData.length}개`)
    console.log(`기존 날짜들: ${Array.from(new Set(analysisData.map(item => item.날짜)))}`)

    // 선택 모드에 따라 필터링
    let filteredData: SamsungMainData[] = []
    
    if (selectionMode === 'category' && categories && categories.length > 0) {
      // 카테고리별 선택
      filteredData = mainData.filter(item => categories.includes(item.구분))
    } else if (selectionMode === 'item' && items && items.length > 0) {
      // 항목별 선택
      filteredData = mainData.filter(item => items.includes(item.연번))
    } else {
      // 기본값: 전체 데이터
      filteredData = mainData
    }

    console.log(`분석할 항목 수: ${filteredData.length}개`)

    const newAnalysisData: SamsungAnalysisData[] = []
    const status: Record<number, 'pending' | 'success' | 'error'> = {}
    let progress = 0

    // 각 항목에 대해 GPT 분석 수행
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i]
      
      try {
        // 진행 상황 업데이트
        progress = Math.round(((i + 1) / filteredData.length) * 100)
        status[item.연번] = 'pending'

        const prompt = item.AI_H지수_프롬프터.replace('{DATE}', date)
        
        console.log(`\n=== 분석 항목 ${item.연번} ===`)
        console.log(`프롬프트: ${prompt}`)
        
        const completion = await openai!.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `당신은 삼성전자 주식 분석 전문가입니다. 

주어진 질문에 대해 반드시 -3, -2, -1, 0, 1, 2, 3 중 하나의 정수로만 답변해야 합니다.

평가 기준 (강한 의견 기반):
-3: 매우 부정적 (심각한 위험, 강한 하락 요인, 즉시 부정적 영향)
-2: 부정적 (명확한 위험 요소, 부정적 전망, 주의 필요)
-1: 약간 부정적 (부정적 요소 존재, 경계 필요, 약간의 우려)
0: 중립 (영향 없음, 변화 없음, 판단 보류)
1: 약간 긍정적 (긍정적 요소 존재, 기대감, 약간의 호재)
2: 긍정적 (명확한 호재, 긍정적 전망, 강한 기대감)
3: 매우 긍정적 (강력한 호재, 즉시 긍정적 영향, 최고의 전망)

분석 원칙:
1. 중립적 판단을 피하고 명확한 의견을 내세요
2. 정보에 민감하게 반응하고 강한 의견을 표현하세요
3. 약간의 긍정/부정 요소도 확대해서 평가하세요
4. 불확실한 경우에도 경향성을 파악하여 판단하세요
5. 시장 반응과 투자자 심리를 고려하여 평가하세요

답변 규칙:
1. 반드시 숫자만 답변하세요 (예: "2", "-1", "0")
2. 설명이나 다른 텍스트를 포함하지 마세요
3. -3에서 3 사이의 정수만 사용하세요
4. 정보의 강도에 따라 적극적으로 평가하세요`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 5,
        })

        const response = completion.choices[0]?.message?.content?.trim()
        let aiHIndex = 0

        console.log(`GPT 응답: "${response}"`)

        // 응답에서 숫자 추출
        if (response) {
          const match = response.match(/-?\d+/)
          if (match) {
            aiHIndex = parseInt(match[0])
            // -3에서 3 사이로 제한
            aiHIndex = Math.max(-3, Math.min(3, aiHIndex))
            console.log(`추출된 AI_H지수: ${aiHIndex}`)
          } else {
            console.log(`❌ 숫자를 찾을 수 없음: "${response}"`)
          }
        } else {
          console.log(`❌ GPT 응답이 비어있음`)
        }

        newAnalysisData.push({
          날짜: date,
          AI_H지수: aiHIndex,
          지수X가중치: aiHIndex * item.가중치,
          구분: item.구분,
          연번: item.연번,
          분야: item.분야
        })

        status[item.연번] = 'success'
        console.log(`✅ 최종 AI_H지수: ${aiHIndex}`)

        // API 호출 간격 조절
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error analyzing item ${item.연번}:`, error)
        // 오류 발생 시 기본값 사용
        newAnalysisData.push({
          날짜: date,
          AI_H지수: 0,
          지수X가중치: 0,
          구분: item.구분,
          연번: item.연번,
          분야: item.분야
        })
        status[item.연번] = 'error'
      }
    }

    // 기존 데이터에 새 데이터 추가
    const updatedAnalysisData = [...analysisData, ...newAnalysisData]

    // 파일에 저장
    fs.writeFileSync(analysisFilePath, JSON.stringify(updatedAnalysisData, null, 2))

    console.log(`\n=== 분석 완료 ===`)
    console.log(`분석 날짜: ${date}`)
    console.log(`새로 추가된 데이터: ${newAnalysisData.length}개`)
    console.log(`총 데이터 수: ${updatedAnalysisData.length}개`)
    console.log(`새 데이터 샘플:`, newAnalysisData[0])

    return NextResponse.json({ 
      success: true, 
      message: `${date} 분석 완료`,
      newData: newAnalysisData,
      progress: 100,
      status
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
} 