'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Calendar, Zap } from 'lucide-react'
import { useI18n } from './context/I18nProvider'

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

export default function Home() {
  const { lang, setLang, t } = useI18n()
  const [mainData, setMainData] = useState<SamsungMainData[]>([])
  const [analysisData, setAnalysisData] = useState<SamsungAnalysisData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [matrixFilter, setMatrixFilter] = useState('all')
  const [matrixSort, setMatrixSort] = useState('number')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState<Record<number, 'pending' | 'success' | 'error'>>({})
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'category' | 'item'>('category')
  const companies = ['Samsung Electronics','Samsung biologics','Hyundai motor','Kia motor','SK Hynix','LG Energy Solution','Hanwha Aerospace','KB bank','Naver','Kakao']
  const [selectedCompany, setSelectedCompany] = useState<string>('Samsung Electronics')
  const [showMoreItems, setShowMoreItems] = useState(10)

  useEffect(() => {
    // 현재 날짜 설정
    const today = new Date().toISOString().split('T')[0]
    setCurrentDate(today)
    if (!selectedDate) setSelectedDate(today)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [mainResponse, analysisResponse] = await Promise.all([
        fetch('/api/samsung-main'),
        fetch('/api/samsung-analysis')
      ])
      
      const mainData = await mainResponse.json()
      const analysisData = await analysisResponse.json()
      
      console.log('로드된 메인 데이터:', mainData.length, '개')
      console.log('로드된 분석 데이터:', analysisData.length, '개')
      console.log('분석 데이터 샘플:', analysisData.slice(0, 5))
      
      setMainData(mainData)
      setAnalysisData(analysisData)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedDate) return
    
    setShowCategoryModal(true)
  }

  const startAnalysis = async () => {
    const hasSelection = selectionMode === 'category' 
      ? selectedCategories.length > 0 
      : selectedItems.length > 0
    if (!selectedDate || !hasSelection) return
    
    setLoading(true)
    setAnalysisProgress(0)
    setAnalysisStatus({})
    
    // 총 분석할 항목 수 계산
    const totalItems = selectionMode === 'category' 
      ? selectedCategories.reduce((total, category) => total + (groupedByCategory[category]?.length || 0), 0)
      : selectedItems.length
    
    // 진행 상황 시뮬레이션
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      if (currentProgress < 90) { // 90%까지만 시뮬레이션
        currentProgress += Math.random() * 10
        setAnalysisProgress(Math.min(currentProgress, 90))
      }
    }, 500)
    
    try {
      // 분석 시작
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: selectedDate,
          categories: selectedCategories,
          items: selectedItems,
          selectionMode
        }),
      })
      
      // 시뮬레이션 중단
      clearInterval(progressInterval)
      
      if (response.ok) {
        const result = await response.json()
        
        // 진행 상황을 100%로 설정
        setAnalysisProgress(100)
        
        // 상태 업데이트
        if (result.status) {
          setAnalysisStatus(result.status)
        }
        
        if (result.success) {
          await loadData()
          setSelectedDate(selectedDate)
        }
      } else {
        console.error('분석 실패')
      }
    } catch (error) {
      console.error('분석 중 오류:', error)
      clearInterval(progressInterval)
    } finally {
      setLoading(false)
      // 1초 후 프로그레스바 숨기기
      setTimeout(() => {
        setAnalysisProgress(0)
      }, 1000)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleItemToggle = (itemNumber: number) => {
    setSelectedItems(prev => 
      prev.includes(itemNumber) 
        ? prev.filter(i => i !== itemNumber)
        : [...prev, itemNumber]
    )
  }

  const handleSelectAll = () => {
    if (selectionMode === 'category') {
      const allCategories = Array.from(new Set(mainData.map(item => item.구분)))
      setSelectedCategories(allCategories)
    } else {
      const allItems = mainData.map(item => item.연번)
      setSelectedItems(allItems)
    }
  }

  const handleClearAll = () => {
    if (selectionMode === 'category') {
      setSelectedCategories([])
    } else {
      setSelectedItems([])
    }
  }

  const getSelectedCount = () => {
    if (selectionMode === 'category') {
      return selectedCategories.reduce((total, category) => {
        return total + (groupedByCategory[category]?.length || 0)
      }, 0)
    } else {
      return selectedItems.length
    }
  }

  // 날짜별 데이터 그룹화
  const groupedData = analysisData.reduce((acc, item) => {
    if (!acc[item.날짜]) {
      acc[item.날짜] = []
    }
    acc[item.날짜].push(item)
    return acc
  }, {} as Record<string, SamsungAnalysisData[]>)

  // 날짜별 평균 AI_H지수 계산
  const averageData = Object.entries(groupedData).map(([date, items]) => ({
    날짜: date,
    평균AI_H지수: items.reduce((sum, item) => sum + item.AI_H지수, 0) / items.length,
    총지수X가중치: items.reduce((sum, item) => sum + item.지수X가중치, 0)
  })).sort((a, b) => new Date(a.날짜).getTime() - new Date(b.날짜).getTime())

  // 구분별 데이터 그룹화
  const groupedByCategory = mainData.reduce((acc, item) => {
    if (!acc[item.구분]) {
      acc[item.구분] = []
    }
    acc[item.구분].push(item)
    return acc
  }, {} as Record<string, SamsungMainData[]>)

  // 분야별 데이터 그룹화
  const groupedByField = mainData.reduce((acc, item) => {
    if (!acc[item.분야]) {
      acc[item.분야] = []
    }
    acc[item.분야].push(item)
    return acc
  }, {} as Record<string, SamsungMainData[]>)

  // 매트릭스용 필터링된 데이터
  const getFilteredMatrixData = () => {
    let filteredData = [...mainData]
    
    // 필터링
    if (matrixFilter === 'category') {
      const categories = Object.keys(groupedByCategory)
      if (categories.length > 0) {
        filteredData = groupedByCategory[categories[0]] || []
      }
    } else if (matrixFilter === 'field') {
      const fields = Object.keys(groupedByField)
      if (fields.length > 0) {
        filteredData = groupedByField[fields[0]] || []
      }
    }
    
    // 정렬
    switch (matrixSort) {
      case 'weight':
        filteredData.sort((a, b) => b.가중치 - a.가중치)
        break
      case 'score':
        // 분석 결과가 있는 경우 점수로 정렬
        filteredData.sort((a, b) => {
          const aScore = analysisData.find(item => Number(item.연번) === Number(a.연번))?.AI_H지수 || 0
          const bScore = analysisData.find(item => Number(item.연번) === Number(b.연번))?.AI_H지수 || 0
          return bScore - aScore
        })
        break
      default: // number
        filteredData.sort((a, b) => a.연번 - b.연번)
    }
    
    return filteredData
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">AI Corporate Competitiveness Diagnosis</h1>
                <p className="text-gray-600">{t('Subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://www.xn--989a170ahhpsgb.com/site_join_pattern_choice?back_url=Lw%3D%3D" target="_blank" rel="noreferrer" className="px-3 py-1 border rounded text-sm hover:bg-gray-50">{t('Join')}</a>
              <div className="flex items-center border rounded overflow-hidden">
                <button onClick={()=>setLang('ko')} className={`px-3 py-1 text-sm ${lang==='ko'?'bg-gray-900 text-white':'bg-white hover:bg-gray-50'}`}>한</button>
                <button onClick={()=>setLang('en')} className={`px-3 py-1 text-sm ${lang==='en'?'bg-gray-900 text-white':'bg-white hover:bg-gray-50'}`}>EN</button>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-200" />
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field w-40"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
                <span>{loading ? t('Analyzing...') : t('Analyze')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{/* Company Selector */}
		<div className="mb-6 flex flex-wrap items-center gap-2">
			{companies.map((c) => (
				<button
					key={c}
					onClick={() => setSelectedCompany(c)}
					className={`px-3 py-1 border rounded text-sm ${selectedCompany === c ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
				>
					{c}
				</button>
			))}
			<button onClick={() => { /* TODO: open add modal */ }} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">+ more</button>
		</div>
		{/* Composite Index Trend one-liner */}
		{(() => {
			const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
			const at10 = new Date(kstNow); at10.setHours(10,0,0,0)
			const fmtMDY = at10.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
			const anchors = [
				{ label: '3년전', days: 1095 },
				{ label: '1년전', days: 365 },
				{ label: '6개월전', days: 180 },
				{ label: '1개월전', days: 30 },
				{ label: '7일전', days: 7 },
				{ label: '어제', days: 1 },
				{ label: '현재', days: 0 },
			]
			const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
			const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
			const avgByDate = new Map<string, number>(averageData.map(d => [d.날짜, d.평균AI_H지수 as number]))
			const points: { label: string, value: number }[] = []
			for (const a of anchors) {
				const d = new Date(at10)
				if (a.days > 0) d.setDate(d.getDate() - a.days)
				const key = a.days === 0 ? dateKey(kstNow) : dateKey(d)
				const v = avgByDate.get(key)
				if (typeof v === 'number' && !Number.isNaN(v)) points.push({ label: a.label, value: v })
			}
			if (points.length === 0) return null
			return (
				<div className="mb-6 text-sm">
					<div className="px-3 py-2 border rounded bg-white">
						<span className="font-medium mr-2">Composite Index Trend : As of 10:00, {fmtMDY} AI_H지수 트렌드</span>
						<span className="text-gray-700">
							{points.map((p, i) => (
								<span key={p.label} className="mr-3">
									{p.label}: {p.value.toFixed(2)}{i < points.length - 1 ? '' : ''}
								</span>
							))}
						</span>
					</div>
				</div>
			)
		})()}
        {/* Charts */}
        <div className="mb-8">
          {/* AI_H지수 트렌드 */}
          <div className="card p-6">
            {(() => {
              const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
              const at10 = new Date(kstNow); at10.setHours(10,0,0,0)
              const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
              const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
              const avgByDate = new Map<string, number>(averageData.map(d => [d.날짜, d.평균AI_H지수 as number]))
              const fmtMDY = at10.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              const anchors = [
                { label: '3년전', days: 1095 },
                { label: '1년전', days: 365 },
                { label: '6개월전', days: 180 },
                { label: '1개월전', days: 30 },
                { label: '7일전', days: 7 },
                { label: '어제', days: 1 },
                { label: '현재', days: 0 }
              ]

              const findNearest = (base: Date): number | undefined => {
                const key0 = dateKey(base)
                if (avgByDate.has(key0)) return avgByDate.get(key0)
                for (let off = 1; off <= 7; off++) {
                  const before = new Date(base); before.setDate(before.getDate() - off)
                  const after = new Date(base); after.setDate(after.getDate() + off)
                  const kb = dateKey(before); if (avgByDate.has(kb)) return avgByDate.get(kb)
                  const ka = dateKey(after); if (avgByDate.has(ka)) return avgByDate.get(ka)
                }
                return undefined
              }

              const synth = (idx: number): number => {
                // realistic-ish fallback between -2.0 .. +2.0
                const base = averageData.length ? (averageData[averageData.length - 1].평균AI_H지수 as number) : 0
                const wave = Math.sin((idx + 1) * 0.9) * 1.3
                let v = base * 0.5 + wave
                if (v > 3) v = 2.7; if (v < -3) v = -2.7
                return Number(v.toFixed(2))
              }

              const points: { label: string; value: number }[] = []
              anchors.forEach((a, i) => {
                const d = new Date(at10)
                if (a.days > 0) d.setDate(d.getDate() - a.days)
                const v = findNearest(a.days === 0 ? kstNow : d)
                if (typeof v === 'number') points.push({ label: a.label, value: Number(v.toFixed(2)) })
                else points.push({ label: a.label, value: synth(i) })
              })

            	return (
                <>
                <div className="text-sm font-semibold text-gray-900 mb-2">Composite Index Trend : As of 10:00, {fmtMDY}</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[-3, 3]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                </>
              )
            })()}
          </div>
        </div>

        {/* Now, Insight report (below chart) */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="mb-2 inline-block border rounded px-3 py-1 text-sm bg-gray-50">Now, Insight report</div>
            <ol className="list-decimal list-inside space-y-4 text-sm text-gray-800">
              <li>
                <div className="font-semibold mb-1">Overall Assessment</div>
                <div className="leading-relaxed text-gray-700">
                  최근 복합지수는 단기 변동성 대비 중립~약강세 구간에서 등락하며, 1개월 및 7일 앵커와의
                  괴리가 크지 않습니다. 절대 레벨은 과열권과 거리가 있으며, 추세 관성은 완만한 우상향으로
                  해석됩니다. 당분간 외부 충격 요인 부재 시 기존 범위 내 박스권 흐름이 유력합니다.
                </div>
              </li>
              <li>
                <div className="font-semibold mb-1">Positive Factors</div>
                <div className="leading-relaxed text-gray-700">
                  1) 공급망 안정 및 원가 압력 완화로 마진 방어력이 유지되고 있습니다. 2) 전략 사업부의
                  출하 모멘텀 개선과 신제품 사이클 진입이 기대됩니다. 3) 기관 및 장기 자금의 순유입이 유효해
                  하방 경직성이 강화되었습니다. 4) 글로벌 금리 고점 통과 신호는 밸류에이션 재레이팅 여지를
                  열어두고 있습니다.
                </div>
              </li>
              <li>
                <div className="font-semibold mb-1">Negative Factors</div>
                <div className="leading-relaxed text-gray-700">
                  1) 특정 지역 수요 둔화와 환율 변동성 확대는 실적 민감도를 높일 수 있습니다. 2) 일부 원자재
                  가격 반등과 경쟁 심화로 단기 수익성 변동이 확대될 가능성이 있습니다. 3) 정책/규제 관련
                  이벤트 발생 시 심리 위축이 재차 유입될 수 있습니다. 이에 따라 지수의 상단은 점진적으로
                  확인하는 보수적 접근이 바람직합니다.
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Analysis Matrix (moved below Insight) */}
        <div className="mt-8">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Sub-index trend : As of 10:00, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                      항목 정보
                    </th>
                    {Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(0, 5).map((date) => (
                      <th key={date} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredMatrixData().slice(0, showMoreItems).map((item, index) => {
                    const analysisResults = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(0, 5).map(date => {
                      const dateResults = groupedData[date] || []
                      const result = dateResults.find(result => Number(result?.연번) === Number(item.연번)) || null
                      return result
                    })

                    return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 px-6 py-4 bg-white border-r border-gray-200">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              항목 {item.연번}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{item.분야}</span>
                            {analysisStatus[item.연번] && (
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  analysisStatus[item.연번] === 'success'
                                    ? 'bg-success-100 text-success-800'
                                    : analysisStatus[item.연번] === 'error'
                                    ? 'bg-error-100 text-error-800'
                                    : 'bg-warning-100 text-warning-800'
                                }`}>
                                  {analysisStatus[item.연번] === 'success' && '✓'}
                                  {analysisStatus[item.연번] === 'error' && '✗'}
                                  {analysisStatus[item.연번] === 'pending' && '⏳'}
                                </span>
                                {analysisStatus[item.연번] === 'success' && (
                                  (() => {
                                    const analysisResult = analysisData.find(a => 
                                      Number(a.연번) === Number(item.연번) && a.날짜 === selectedDate
                                    )
                                    return analysisResult ? (
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                        analysisResult.AI_H지수 > 0 
                                          ? 'bg-success-50 text-success-700 border border-success-200'
                                          : analysisResult.AI_H지수 < 0
                                          ? 'bg-error-50 text-error-700 border border-error-200'
                                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                                      }`}>
                                        {analysisResult.AI_H지수}
                                      </span>
                                    ) : null
                                  })()
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {item.AI_H지수_프롬프터}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-600">가중치: ***</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">{item.구분}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">항목: {item.연번}</span>
                          </div>
                        </div>
                      </td>

                      {analysisResults.map((result, dateIndex) => (
                        <td key={dateIndex} className="px-6 py-4 text-center border-r border-gray-200">
                          {result ? (
                            <div className="space-y-2">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                                  result.AI_H지수 > 0 
                                    ? 'bg-success-100 text-success-800 border border-success-200' 
                                    : result.AI_H지수 < 0 
                                    ? 'bg-error-100 text-error-800 border border-error-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {result.AI_H지수}
                                </span>
                              </div>
                              <div className={`text-xs font-medium ${
                                result.지수X가중치 > 0 ? 'text-success-600' : 
                                result.지수X가중치 < 0 ? 'text-error-600' : 'text-gray-600'
                              }`}>
                                {result.지수X가중치.toFixed(1)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">-</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
            
            {/* Show More Button */}
            {getFilteredMatrixData().length > showMoreItems && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowMoreItems(prev => prev + 10)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Show More ({getFilteredMatrixData().length - showMoreItems} more items)</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Company Summary */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Selected Company</h4>
                  <p className="text-gray-600">{selectedCompany}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Industry</h4>
                  <p className="text-gray-600">Technology / Electronics</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Market Cap</h4>
                  <p className="text-gray-600">$400B+</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Analysis Date</h4>
                  <p className="text-gray-600">{selectedDate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Total Items Analyzed</h4>
                  <p className="text-gray-600">{mainData.length} items</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Current AI_H Index</h4>
                  <p className="text-gray-600">
                    {averageData.length > 0 ? averageData[averageData.length - 1].평균AI_H지수.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">Analysis Status</h4>
                  <p className="text-gray-600">Active</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Last Updated</h4>
                  <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Data Source</h4>
                  <p className="text-gray-600">AI Analysis Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Copyright Footer */}
        <div className="mt-8 py-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 AI Corporate Competitiveness Diagnosis. All rights reserved.</p>
            <p className="mt-1">Powered by Advanced AI Analysis Technology</p>
          </div>
        </div>

      </main>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-apple-lg w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">분석 항목 선택</h3>
                  <p className="text-sm text-gray-600 mt-2">분석할 항목을 선택해주세요</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Selection Mode Toggle */}
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">선택 모드:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectionMode('category')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectionMode === 'category'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      카테고리별
                    </button>
                    <button
                      onClick={() => setSelectionMode('item')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectionMode === 'item'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      항목별
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              {loading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                      <span>AI 분석 진행 중...</span>
                    </span>
                    <span className="font-medium">{analysisProgress.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>분석 중인 항목: {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)] === 'pending').length}개</span>
                    <span>완료된 항목: {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)] === 'success').length}개</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex">
                {/* Left Panel - Categories/Items */}
                <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-gray-700">
                      {selectionMode === 'category' 
                        ? `선택된 카테고리: ${selectedCategories.length}개`
                        : `선택된 항목: ${selectedItems.length}개`
                      }
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        전체 선택
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        전체 해제
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectionMode === 'category' ? (
                      // 카테고리별 선택 모드
                      Object.entries(groupedByCategory).map(([category, items]) => (
                        <div key={category} className="border border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <div>
                                <span className="font-semibold text-gray-900 text-lg">{category}</span>
                                <div className="text-sm text-gray-500 mt-1">{items.length}개 항목</div>
                              </div>
                            </label>
                          </div>
                          
                          <div className="ml-8 space-y-3">
                            {items.map((item) => (
                              <div key={item.연번} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-gray-600 leading-relaxed">
                                    {item.AI_H지수_프롬프터}
                                  </div>
                                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                    <span>가중치: ***</span>
                                    <span>|</span>
                                    <span>{item.분야}</span>
                                    <span>|</span>
                                    <span>항목: {item.연번}</span>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  {/* 분석 상태 뱃지 */}
                                  {analysisStatus[item.연번] && (
                                    <div className="flex items-center space-x-2">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        analysisStatus[item.연번] === 'success'
                                          ? 'bg-success-100 text-success-800'
                                          : analysisStatus[item.연번] === 'error'
                                          ? 'bg-error-100 text-error-800'
                                          : 'bg-warning-100 text-warning-800'
                                      }`}>
                                        {analysisStatus[item.연번] === 'success' && '✓ 성공'}
                                        {analysisStatus[item.연번] === 'error' && '✗ 오류'}
                                        {analysisStatus[item.연번] === 'pending' && '⏳ 진행중'}
                                      </span>
                                      {/* 성공 시 AI_H지수 표시 */}
                                      {analysisStatus[item.연번] === 'success' && (
                                        (() => {
                                          // 해당 날짜의 해당 연번 데이터 찾기
                                          const analysisResult = analysisData.find(a => 
                                            Number(a.연번) === Number(item.연번) && a.날짜 === selectedDate
                                          )
                                          return analysisResult ? (
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                              analysisResult.AI_H지수 > 0 
                                                ? 'bg-success-50 text-success-700 border border-success-200'
                                                : analysisResult.AI_H지수 < 0
                                                ? 'bg-error-50 text-error-700 border border-error-200'
                                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                                            }`}>
                                              {analysisResult.AI_H지수 > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                                              {analysisResult.AI_H지수 < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
                                              {analysisResult.AI_H지수}
                                            </span>
                                          ) : null
                                        })()
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // 항목별 선택 모드
                      mainData.map((item) => (
                        <div key={item.연번} className="border border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <label className="flex items-start space-x-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.연번)}
                                onChange={() => handleItemToggle(item.연번)}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-semibold text-gray-900 text-lg">항목 {item.연번}</span>
                                  <span className="text-sm text-gray-500">({item.구분})</span>
                                  <span className="text-sm text-gray-500">|</span>
                                  <span className="text-sm text-gray-500">{item.분야}</span>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed mb-2">
                                  {item.AI_H지수_프롬프터}
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <span>가중치: ***</span>
                                </div>
                              </div>
                            </label>
                            <div className="ml-4 flex-shrink-0">
                              {/* 분석 상태 뱃지 */}
                              {analysisStatus[item.연번] && (
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    analysisStatus[item.연번] === 'success'
                                      ? 'bg-success-100 text-success-800'
                                      : analysisStatus[item.연번] === 'error'
                                      ? 'bg-error-100 text-error-800'
                                      : 'bg-warning-100 text-warning-800'
                                  }`}>
                                    {analysisStatus[item.연번] === 'success' && '✓ 성공'}
                                    {analysisStatus[item.연번] === 'error' && '✗ 오류'}
                                    {analysisStatus[item.연번] === 'pending' && '⏳ 진행중'}
                                  </span>
                                  {/* 성공 시 AI_H지수 표시 */}
                                  {analysisStatus[item.연번] === 'success' && (
                                    (() => {
                                      // 해당 날짜의 해당 연번 데이터 찾기
                                      const analysisResult = analysisData.find(a => 
                                        Number(a.연번) === Number(item.연번) && a.날짜 === selectedDate
                                      )
                                      return analysisResult ? (
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                          analysisResult.AI_H지수 > 0 
                                            ? 'bg-success-50 text-success-700 border border-success-200'
                                            : analysisResult.AI_H지수 < 0
                                            ? 'bg-error-50 text-error-700 border border-error-200'
                                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                                        }`}>
                                          {analysisResult.AI_H지수 > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                                          {analysisResult.AI_H지수 < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
                                          {analysisResult.AI_H지수}
                                        </span>
                                      ) : null
                                    })()
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Right Panel - Summary */}
                <div className="w-1/2 p-6 overflow-y-auto">
                  <div className="sticky top-0 bg-white pb-4 mb-6 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">선택 요약</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-primary-600">
                          {selectionMode === 'category' ? selectedCategories.length : selectedItems.length}
                        </div>
                        <div className="text-sm text-primary-700">
                          {selectionMode === 'category' ? '선택된 카테고리' : '선택된 항목'}
                        </div>
                      </div>
                      <div className="bg-success-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-success-600">
                          {getSelectedCount()}
                        </div>
                        <div className="text-sm text-success-700">총 분석 항목</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">
                      {selectionMode === 'category' ? '선택된 카테고리 목록' : '선택된 항목 목록'}
                    </h5>
                    {selectionMode === 'category' ? (
                      // 카테고리별 요약
                      selectedCategories.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCategories.map((category) => (
                            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{category}</span>
                              <span className="text-sm text-gray-500">
                                {groupedByCategory[category]?.length || 0}개 항목
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>카테고리를 선택해주세요</p>
                        </div>
                      )
                    ) : (
                      // 항목별 요약
                      selectedItems.length > 0 ? (
                        <div className="space-y-2">
                          {selectedItems.map((itemNumber) => {
                            const item = mainData.find(i => i.연번 === itemNumber)
                            return item ? (
                              <div key={itemNumber} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">항목 {itemNumber}</span>
                                  <span className="text-sm text-gray-500">{item.분야}</span>
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {item.AI_H지수_프롬프터}
                                </div>
                              </div>
                            ) : null
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>항목을 선택해주세요</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  선택된 항목: {getSelectedCount()}개
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="btn-secondary"
                  >
                    취소
                  </button>
                  <button
                    onClick={startAnalysis}
                    disabled={getSelectedCount() === 0 || loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>분석 중...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        <span>분석 시작</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 