'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Calendar, Zap } from 'lucide-react'

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
      <header className="bg-white shadow-apple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Samsung Analysis</h1>
                <p className="text-gray-600">삼성전자 AI 분석 대시보드</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                <span>{loading ? '분석 중...' : 'AI 분석'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 분석 항목</p>
                <p className="text-3xl font-bold text-gray-900">{mainData.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">최근 평균 AI_H지수</p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageData.length > 0 ? averageData[averageData.length - 1].평균AI_H지수.toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">분석된 날짜</p>
                <p className="text-3xl font-bold text-gray-900">{Object.keys(groupedData).length}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI_H지수 트렌드 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI_H지수 트렌드</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={averageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="날짜" />
                <YAxis domain={[-3, 3]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="평균AI_H지수" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 가중치별 분포 */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">가중치별 지수 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="날짜" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="총지수X가중치" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Data by Category and Field */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* 구분별 분석 데이터 */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">구분별 분석 데이터</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      구분
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      항목 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평균 가중치
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedByCategory).map(([category, items]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ***
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 분야별 분석 데이터 */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">분야별 분석 데이터</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      분야
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      항목 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평균 가중치
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedByField).map(([field, items]) => (
                    <tr key={field} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {field}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ***
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
          {/* 평균 AI_H지수 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 AI_H지수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisData.length > 0 
                    ? (analysisData.reduce((sum, item) => sum + item.AI_H지수, 0) / analysisData.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>

          {/* 최고 점수 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">최고 점수</p>
                <p className="text-2xl font-bold text-success-600">
                  {analysisData.length > 0 
                    ? Math.max(...analysisData.map(item => item.AI_H지수))
                    : '0'
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </div>

          {/* 최저 점수 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">최저 점수</p>
                <p className="text-2xl font-bold text-error-600">
                  {analysisData.length > 0 
                    ? Math.min(...analysisData.map(item => item.AI_H지수))
                    : '0'
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-error-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-error-600" />
              </div>
            </div>
          </div>

          {/* 총 분석 항목 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 분석 항목</p>
                <p className="text-2xl font-bold text-gray-900">{mainData.length}</p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Matrix */}
        <div className="mt-8">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">분석 매트릭스</h3>
              <p className="text-sm text-gray-600 mt-1">상세 분석 데이터와 분석 결과를 매트릭스 형태로 표시</p>
            </div>
            
            {/* Matrix Controls */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">분석 기준:</label>
                  <select 
                    value={matrixFilter}
                    onChange={(e) => setMatrixFilter(e.target.value)}
                    className="input-field w-32 text-sm"
                  >
                    <option value="all">전체</option>
                    <option value="category">구분별</option>
                    <option value="field">분야별</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">정렬:</label>
                  <select 
                    value={matrixSort}
                    onChange={(e) => setMatrixSort(e.target.value)}
                    className="input-field w-32 text-sm"
                  >
                    <option value="number">항목순</option>
                    <option value="weight">가중치순</option>
                    <option value="score">점수순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
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
                    {getFilteredMatrixData().slice(0, 15).map((item, index) => {
                      // 해당 연번의 분석 결과 찾기
                      const analysisResults = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).slice(0, 5).map(date => {
                        const dateResults = groupedData[date] || []
                        const result = dateResults.find(result => {
                          // 타입 안전성을 위해 숫자로 변환하여 비교
                          const itemNumber = Number(item.연번)
                          const resultNumber = Number(result?.연번)
                          return resultNumber === itemNumber
                        }) || null
                        if (index === 0) {
                          console.log(`항목 ${item.연번} (${typeof item.연번}), 날짜 ${date}:`, result)
                          console.log('날짜별 데이터:', dateResults.slice(0, 3))
                        }
                        return result
                      })

                      return (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* 항목 정보 컬럼 */}
                        <td className="sticky left-0 z-10 px-6 py-4 bg-white border-r border-gray-200">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                항목 {item.연번}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{item.분야}</span>
                              {/* 분석 상태 뱃지 */}
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

                        {/* 날짜별 분석 결과 */}
                        {analysisResults.map((result, dateIndex) => (
                          <td key={dateIndex} className="px-6 py-4 text-center border-r border-gray-200">
                            {result ? (
                              <div className="space-y-2">
                                {/* AI_H지수 */}
                                <div className="flex justify-center">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                                    result.AI_H지수 > 0 
                                      ? 'bg-success-100 text-success-800 border border-success-200 hover:bg-success-200' 
                                      : result.AI_H지수 < 0 
                                      ? 'bg-error-100 text-error-800 border border-error-200 hover:bg-error-200'
                                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                                  }`}>
                                    {result.AI_H지수 > 0 && <TrendingUp className="w-4 h-4 mr-1" />}
                                    {result.AI_H지수 < 0 && <TrendingDown className="w-4 h-4 mr-1" />}
                                    {result.AI_H지수}
                                  </span>
                                </div>
                                
                                {/* 지수 × 가중치 */}
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