'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Calendar, Zap, LogOut, User } from 'lucide-react'
import { useI18n } from './context/I18nProvider'
import AuthModal from './components/AuthModal'
import ErrorDetailModal from './components/ErrorDetailModal'
import api from './services/api'

interface SamsungMainData {
  id: string
  companyId: string
  구분: string  // category
  연번: number  // sequenceNumber
  AI_H지수_프롬프터: string  // item or question
  가중치: number  // weight
  분야: string  // field (추가 필드)
  // DB fields
  category?: string
  categoryEn?: string
  sequenceNumber?: number
  item?: string
  itemEn?: string
  question?: string
  questionEn?: string
  weight?: number
  field?: string
  generalRule?: string
  generalRuleEn?: string
  source?: string
  sourceEn?: string
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
  const [analysisStatus, setAnalysisStatus] = useState<Record<number, any>>({})
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'category' | 'item'>('category')
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [showMoreItems, setShowMoreItems] = useState(10)
  const [showAllCompanies, setShowAllCompanies] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [selectedError, setSelectedError] = useState<any>(null)

  useEffect(() => {
    // 현재 날짜 설정
    const today = new Date().toISOString().split('T')[0]
    setCurrentDate(today)
    if (!selectedDate) setSelectedDate(today)
    
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      // Set the token in API service
      api.setToken(token)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
    
    loadCompanies()
  }, [])

  // 사용자 메뉴 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showUserMenu])

  // 선택된 기업이 변경되면 데이터 로드
  useEffect(() => {
    if (selectedCompany) {
      loadData()
    }
  }, [selectedCompany])

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        // 첫 번째 기업을 기본으로 선택
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0])
        }
      }
    } catch (error) {
      console.error('기업 목록 로드 실패:', error)
    }
  }

  const loadData = async () => {
    if (!selectedCompany) return
    
    try {
      // 선택된 기업의 데이터 로드
      const [mainDataResponse, analysisDataResponse] = await Promise.all([
        api.getSamsungMain(selectedCompany.id),
        api.getSamsungAnalysis(selectedCompany.id)
      ])
      
      // DB 필드를 한글 필드로 변환
      const transformedMainData = mainDataResponse.map((item: any) => ({
        id: item.id,
        companyId: item.companyId,
        구분: item.category || item.구분 || '',
        연번: item.sequenceNumber || item.연번 || 0,
        AI_H지수_프롬프터: item.item || item.question || item.AI_H지수_프롬프터 || '',
        가중치: item.weight || item.가중치 || 0,
        분야: '', // field column doesn't exist in DB yet
        // 원본 DB 필드도 보관
        category: item.category,
        sequenceNumber: item.sequenceNumber,
        item: item.item,
        question: item.question,
        weight: item.weight,
        scale: item.scale,
        generalRule: item.generalRule,
        modifiedScale: item.modifiedScale,
        cumulativeScore: item.cumulativeScore,
        index: item.index,
        source: item.source
      }))
      
      // Analysis 데이터를 SamsungAnalysisData 형태로 변환
      const transformedAnalysisData = analysisDataResponse.map((item: any) => ({
        날짜: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        AI_H지수: item.scale || 0,
        지수X가중치: item.index || 0,
        구분: item.category || '',
        연번: item.sequenceNumber || 0,
        분야: '', // field는 아직 DB에 없음
        // 원본 데이터도 보관
        ...item
      }))
      
      console.log(`${selectedCompany.nameKr || selectedCompany.name} 메인 데이터:`, transformedMainData.length, '개')
      console.log(`${selectedCompany.nameKr || selectedCompany.name} 분석 데이터:`, transformedAnalysisData.length, '개')
      
      setMainData(transformedMainData)
      setAnalysisData(transformedAnalysisData)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    }
  }

  const handleLogin = (token: string, user: any) => {
    // Update the API service token
    api.setToken(token)
    setUser(user)
    setIsAuthenticated(true)
    
    // 관리자인 경우 관리자 페이지로 리다이렉트
    if (user.role === 'ADMIN') {
      window.location.href = '/admin'
    } else {
      loadData()
    }
  }

  const handleLogout = () => {
    api.clearToken()
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleErrorClick = (item: any) => {
    const errorInfo = analysisStatus[item.연번]
    if (errorInfo?.status === 'error') {
      setSelectedError({
        sequenceNumber: item.연번,
        item: item.AI_H지수_프롬프터 || item.item || item.question,
        message: errorInfo.message || 'Unknown error',
        status: errorInfo.status,
        category: item.구분 || item.category
      })
      setShowErrorModal(true)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedDate || !selectedCompany) return
    
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    
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
      const result = await api.analyze({ 
        date: selectedDate,
        categories: selectedCategories,
        items: selectedItems,
        selectionMode,
        companyId: selectedCompany?.id
      })
      
      // 시뮬레이션 중단
      clearInterval(progressInterval)
      
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
    } catch (error: any) {
      console.error('분석 중 오류:', error)
      clearInterval(progressInterval)
      
      // 오류 메시지 표시
      const errorMessage = error?.response?.data?.details || error?.message || '분석 중 오류가 발생했습니다.'
      alert(`분석 실패: ${errorMessage}`)
      
      // 오류 상태 표시
      if (error?.response?.data?.status) {
        setAnalysisStatus(error.response.data.status)
      }
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
  // Category translation helper
  const translateCategory = (category: string): string => {
    if (!category) return ''
    
    // Normalize category by removing variations
    const normalized = category.replace(/\s*(변수|요인)\s*$/g, '').trim()
    
    const categoryMap: Record<string, { ko: string; en: string }> = {
      'I.기업내생': { ko: 'I. 기업내생변수', en: 'I. Internal Factors' },
      'I. 기업내생': { ko: 'I. 기업내생변수', en: 'I. Internal Factors' },
      'II.시장': { ko: 'II. 시장변수', en: 'II. Market Factors' },
      'II. 시장': { ko: 'II. 시장변수', en: 'II. Market Factors' },
      'III.정치': { ko: 'III. 정치요인', en: 'III. Political Factors' },
      'III. 정치': { ko: 'III. 정치요인', en: 'III. Political Factors' },
      'III.정치행정': { ko: 'III. 정치행정요인', en: 'III. Political/Admin Factors' },
      'IV.국제관계': { ko: 'IV. 국제관계', en: 'IV. International Relations' },
      'IV. 국제관계': { ko: 'IV. 국제관계', en: 'IV. International Relations' },
      'V.사회문화': { ko: 'V. 사회문화', en: 'V. Social/Cultural Factors' },
      'V. 사회문화': { ko: 'V. 사회문화', en: 'V. Social/Cultural Factors' },
      'V.사회': { ko: 'V. 사회변수', en: 'V. Social Factors' }
    }
    
    // Find matching key
    for (const key in categoryMap) {
      if (normalized.includes(key)) {
        return lang === 'ko' ? categoryMap[key].ko : categoryMap[key].en
      }
    }
    
    // If no match found, return original
    return category
  }
  
  // Field translation helper  
  const translateField = (field: string): string => {
    if (!field) return ''
    
    const fieldMap: Record<string, { ko: string; en: string }> = {
      '경영': { ko: '경영', en: 'Management' },
      '재무': { ko: '재무', en: 'Finance' },
      '기술': { ko: '기술', en: 'Technology' },
      '시장': { ko: '시장', en: 'Market' },
      '정치': { ko: '정치', en: 'Politics' },
      '국제': { ko: '국제', en: 'International' },
      '사회': { ko: '사회', en: 'Society' }
    }
    
    return fieldMap[field]?.[lang] || field
  }
  
  // Get translated analysis item text from database
  const getTranslatedAnalysisItem = (item: SamsungMainData): string => {
    if (lang === 'ko') {
      return item.AI_H지수_프롬프터 || item.item || item.question || ''
    }
    
    // For English, use the English fields if available, otherwise fallback to Korean
    return item.itemEn || item.questionEn || item.AI_H지수_프롬프터 || item.item || item.question || ''
  }
  
  // Get translated category from database  
  const getTranslatedCategory = (item: SamsungMainData): string => {
    if (lang === 'ko') {
      return item.구분 || item.category || ''
    }
    
    // For English, use the English category if available, otherwise fallback to translated category
    return item.categoryEn || translateCategory(item.구분 || item.category || '')
  }

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
              {/* 언어 선택 */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    lang === 'en' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ko')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    lang === 'ko' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  KR
                </button>
              </div>
              
              {/* 사용자 메뉴 */}
              {isAuthenticated ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name || user?.email}</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {(user?.name || user?.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{user?.name || '사용자'}</div>
                            <div className="text-xs text-gray-500">{user?.email}</div>
                            <div className="mt-1">
                              {user?.role === 'ADMIN' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                                  {t('Admin')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                  {t('User')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {user?.role === 'ADMIN' && (
                        <>
                          <a
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                              <span>{t('AdminDashboard')}</span>
                            </div>
                          </a>
                          <div className="border-t border-gray-100"></div>
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>{t('Logout')}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition-all transform hover:scale-105"
                >
                  {t('Login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{/* Company Selector */}
		<div className="mb-4 flex flex-wrap items-center gap-2">
			{(showAllCompanies ? companies : companies.slice(0, 5)).map((company) => (
				<button
					key={company.id}
					onClick={() => setSelectedCompany(company)}
					className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all ${
						selectedCompany?.id === company.id 
							? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md' 
							: 'bg-white hover:bg-gray-50 border-gray-300'
					}`}
				>
					{lang === 'ko' ? (company.nameKr || company.name) : (company.name || company.nameKr)}
					{company.dataCount > 0 && (
						<span className="ml-1.5 text-xs opacity-80">({company.dataCount})</span>
					)}
				</button>
			))}
			
			{/* 더보기/접기 버튼 */}
			{companies.length > 5 && (
				<button
					onClick={() => setShowAllCompanies(!showAllCompanies)}
					className="px-3 py-1.5 border border-dashed border-gray-400 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors flex items-center gap-1"
				>
					{showAllCompanies ? (
						<>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
							</svg>
							{t('ShowLess')}
						</>
					) : (
						<>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
							{t('ShowMore')} ({companies.length - 5}{lang === 'ko' ? '개' : ''})
						</>
					)}
				</button>
			)}
			
			{/* 관리자 전용 관리 버튼 */}
			{user?.role === 'ADMIN' && (
				<a 
					href="/admin" 
					className="px-3 py-1.5 border border-purple-400 rounded-lg hover:bg-purple-50 text-sm font-medium text-purple-600 transition-colors flex items-center gap-1"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					{t('Manage')}
				</a>
			)}
		</div>
		
		{/* Date selector and AI Analysis button - Only shown when company is selected */}
		{selectedCompany && (
			<div className="mb-6 flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium text-gray-700">{t('SelectedCompany')}</span>
					<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-semibold">
						{lang === 'ko' ? (selectedCompany.nameKr || selectedCompany.name) : (selectedCompany.name || selectedCompany.nameKr)}
					</span>
				</div>
				
				<div className="flex-1" />
				
				<div className="flex items-center gap-3">
					<div className="flex items-center space-x-2">
						<Calendar className="w-5 h-5 text-gray-500" />
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					
					<button
						onClick={handleAnalyze}
						disabled={loading || !selectedCompany}
						className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 text-sm font-medium transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<Activity className="w-4 h-4" />
						)}
						<span>{loading ? t('Analyzing...') : t('Analyze')}</span>
					</button>
				</div>
			</div>
		)}
		{/* Composite Index Trend one-liner */}
		{(() => {
			const kstNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
			const at10 = new Date(kstNow); at10.setHours(10,0,0,0)
			const fmtMDY = at10.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
			const anchors = [
				{ label: lang === 'ko' ? '3년전' : '3 years ago', days: 1095 },
				{ label: lang === 'ko' ? '1년전' : '1 year ago', days: 365 },
				{ label: lang === 'ko' ? '6개월전' : '6 months ago', days: 180 },
				{ label: lang === 'ko' ? '1개월전' : '1 month ago', days: 30 },
				{ label: lang === 'ko' ? '7일전' : '7 days ago', days: 7 },
				{ label: lang === 'ko' ? '어제' : 'Yesterday', days: 1 },
				{ label: lang === 'ko' ? '현재' : 'Current', days: 0 },
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
				// 실제 데이터가 있을 때만 추가
				if (typeof v === 'number' && !Number.isNaN(v)) {
					points.push({ label: a.label, value: v })
				}
			}
			// 데이터가 없으면 표시하지 않음
			if (points.length === 0) return null
			return (
				<div className="mb-6 text-sm">
					<div className="px-3 py-2 border rounded bg-white">
						<span className="font-medium mr-2">{t('CompositeIndexTrend')} : As of 10:00, {fmtMDY}</span>
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
                { label: lang === 'ko' ? '3년전' : '3 years ago', days: 1095 },
                { label: lang === 'ko' ? '1년전' : '1 year ago', days: 365 },
                { label: lang === 'ko' ? '6개월전' : '6 months ago', days: 180 },
                { label: lang === 'ko' ? '1개월전' : '1 month ago', days: 30 },
                { label: lang === 'ko' ? '7일전' : '7 days ago', days: 7 },
                { label: lang === 'ko' ? '어제' : 'Yesterday', days: 1 },
                { label: lang === 'ko' ? '현재' : 'Current', days: 0 }
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
                // 실제 데이터가 있을 때만 추가
                if (typeof v === 'number') {
                  points.push({ label: a.label, value: Number(v.toFixed(2)) })
                }
              })

            	return (
                <>
                <div className="text-sm font-semibold text-gray-900 mb-2">{t('CompositeIndexTrend')} : As of 10:00, {fmtMDY}</div>
                {points.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm">{lang === 'ko' ? '분석 데이터가 없습니다' : 'No analysis data available'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {lang === 'ko' ? 'AI 분석을 실행하여 데이터를 생성해주세요' : 'Please run AI analysis to generate data'}
                      </p>
                    </div>
                  </div>
                )}
                </>
              )
            })()}
          </div>
        </div>

        {/* Now, Insight report (below chart) */}
        <div className="mb-8">
          <div className="card p-6">
            <div className="mb-2 inline-block border rounded px-3 py-1 text-sm bg-gray-50">{t('NowReport')}, {t('InsightReport')}</div>
            <ol className="list-decimal list-inside space-y-4 text-sm text-gray-800">
              <li>
                <div className="font-semibold mb-1">{lang === 'ko' ? '전체 평가' : 'Overall Assessment'}</div>
                <div className="leading-relaxed text-gray-700">
                  {lang === 'ko' ? 
                    '최근 복합지수는 단기 변동성 대비 중립~약강세 구간에서 등락하며, 1개월 및 7일 앵커와의 괴리가 크지 않습니다. 절대 레벨은 과열권과 거리가 있으며, 추세 관성은 완만한 우상향으로 해석됩니다. 당분간 외부 충격 요인 부재 시 기존 범위 내 박스권 흐름이 유력합니다.' :
                    'The recent composite index fluctuates in the neutral to slightly bullish range relative to short-term volatility, with minimal deviation from the 1-month and 7-day anchors. The absolute level remains distant from overheated territory, and the trend momentum is interpreted as a gentle upward slope. In the absence of external shock factors, a box-range pattern within existing boundaries is likely for the time being.'
                  }
                </div>
              </li>
              <li>
                <div className="font-semibold mb-1">{lang === 'ko' ? '긍정적 요인' : 'Positive Factors'}</div>
                <div className="leading-relaxed text-gray-700">
                  {lang === 'ko' ?
                    '1) 공급망 안정 및 원가 압력 완화로 마진 방어력이 유지되고 있습니다. 2) 전략 사업부의 출하 모멘텀 개선과 신제품 사이클 진입이 기대됩니다. 3) 기관 및 장기 자금의 순유입이 유효해 하방 경직성이 강화되었습니다. 4) 글로벌 금리 고점 통과 신호는 밸류에이션 재레이팅 여지를 열어두고 있습니다.' :
                    '1) Margin defense is maintained through supply chain stabilization and cost pressure relief. 2) Improvements in strategic business unit shipment momentum and entry into new product cycles are expected. 3) Net inflows from institutional and long-term funds remain effective, strengthening downside rigidity. 4) Signals of passing global interest rate peaks leave room for valuation re-rating.'
                  }
                </div>
              </li>
              <li>
                <div className="font-semibold mb-1">{lang === 'ko' ? '부정적 요인' : 'Negative Factors'}</div>
                <div className="leading-relaxed text-gray-700">
                  {lang === 'ko' ?
                    '1) 특정 지역 수요 둔화와 환율 변동성 확대는 실적 민감도를 높일 수 있습니다. 2) 일부 원자재 가격 반등과 경쟁 심화로 단기 수익성 변동이 확대될 가능성이 있습니다. 3) 정책/규제 관련 이벤트 발생 시 심리 위축이 재차 유입될 수 있습니다. 이에 따라 지수의 상단은 점진적으로 확인하는 보수적 접근이 바람직합니다.' :
                    '1) Regional demand slowdowns and increased exchange rate volatility may heighten earnings sensitivity. 2) Some raw material price rebounds and intensified competition may expand short-term profitability fluctuations. 3) Policy/regulatory events may trigger renewed psychological contraction. Accordingly, a conservative approach to gradually confirming index tops is advisable.'
                  }
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
                {t('SubIndexTrend')} : As of 10:00, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                      {t('Item')}
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
                    <tr key={`matrix-row-${item.연번}-${item.id}`} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 px-6 py-4 bg-white border-r border-gray-200">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {t('Item')} {item.연번}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{translateField(item.분야)}</span>
                            {analysisStatus[item.연번] && (
                              <div className="flex items-center space-x-2">
                                <span 
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  analysisStatus[item.연번]?.status === 'success'
                                    ? 'bg-success-100 text-success-800'
                                    : analysisStatus[item.연번]?.status === 'error'
                                    ? 'bg-error-100 text-error-800 cursor-pointer hover:bg-error-200 transition-colors'
                                    : 'bg-warning-100 text-warning-800'
                                }`}
                                  onClick={() => analysisStatus[item.연번]?.status === 'error' && handleErrorClick(item)}
                                  title={analysisStatus[item.연번]?.status === 'error' ? '클릭하여 오류 상세 정보 보기' : ''}
                                >
                                  {analysisStatus[item.연번]?.status === 'success' && '✓'}
                                  {analysisStatus[item.연번]?.status === 'error' && '✗'}
                                  {analysisStatus[item.연번]?.status === 'pending' && '⏳'}
                                </span>
                                {analysisStatus[item.연번]?.status === 'success' && (
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
                            {getTranslatedAnalysisItem(item)}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-600">{t('Weight')}: ***</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">{getTranslatedCategory(item)}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">{t('Item')}: {item.연번}</span>
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
                  <span>{t('ShowMore')} ({getFilteredMatrixData().length - showMoreItems} {t('more')} {t('items')})</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('CompanySummary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{t('SelectedCompany').replace(':', '')}</h4>
                  <p className="text-gray-600">
                    {lang === 'ko' ? (selectedCompany?.nameKr || selectedCompany?.name) : (selectedCompany?.name || selectedCompany?.nameKr) || t('SelectCompany')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{lang === 'ko' ? '산업' : 'Industry'}</h4>
                  <p className="text-gray-600">{lang === 'ko' ? '기술 / 전자' : 'Technology / Electronics'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{lang === 'ko' ? '시가총액' : 'Market Cap'}</h4>
                  <p className="text-gray-600">$400B+</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{t('AnalysisDate')}</h4>
                  <p className="text-gray-600">{selectedDate}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('TotalAnalysisItems')}</h4>
                  <p className="text-gray-600">{mainData.length} {t('items')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('CurrentIndex')}</h4>
                  <p className="text-gray-600">
                    {averageData.length > 0 ? averageData[averageData.length - 1].평균AI_H지수.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{lang === 'ko' ? '분석 상태' : 'Analysis Status'}</h4>
                  <p className="text-gray-600">{lang === 'ko' ? '활성' : 'Active'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{lang === 'ko' ? '최근 업데이트' : 'Last Updated'}</h4>
                  <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{lang === 'ko' ? '데이터 소스' : 'Data Source'}</h4>
                  <p className="text-gray-600">{lang === 'ko' ? 'AI 분석 엔진' : 'AI Analysis Engine'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Copyright Footer */}
        <div className="mt-8 py-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 {lang === 'ko' ? 'AI 기업 경쟁력 진단' : 'AI Corporate Competitiveness Diagnosis'}. {lang === 'ko' ? '모든 권리 보유' : 'All rights reserved'}.</p>
            <p className="mt-1">{lang === 'ko' ? '고급 AI 분석 기술 제공' : 'Powered by Advanced AI Analysis Technology'}</p>
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
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {lang === 'ko' ? (selectedCompany?.nameKr || selectedCompany?.name) : (selectedCompany?.name || selectedCompany?.nameKr)} {t('SelectAnalysisItems')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedDate} - {t('SelectItemsToAnalyze')}
                  </p>
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
                  <span className="text-sm font-medium text-gray-700">{t('SelectionMode')}</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectionMode('category')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectionMode === 'category'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('ByCategory')}
                    </button>
                    <button
                      onClick={() => setSelectionMode('item')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectionMode === 'item'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('ByItem')}
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
                      <span>{t('AnalysisInProgress')}</span>
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
                    <span>{t('ItemsInProgress')} {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'pending').length}{lang === 'ko' ? '개' : ''}</span>
                    <span>{t('ItemsCompleted')} {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'success').length}{lang === 'ko' ? '개' : ''}</span>
                    {Object.keys(analysisStatus).some(key => analysisStatus[Number(key)]?.status === 'error') && (
                      <span className="text-red-600 ml-4">
                        {lang === 'ko' ? '오류' : 'Errors'}: {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'error').length}{lang === 'ko' ? '개' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* 오류 항목 요약 */}
                  {!loading && Object.keys(analysisStatus).some(key => analysisStatus[Number(key)]?.status === 'error') && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-900">
                            {lang === 'ko' 
                              ? `분석 중 ${Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'error').length}개 항목에서 오류가 발생했습니다`
                              : `${Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'error').length} items failed during analysis`
                            }
                          </h4>
                          <p className="text-xs text-red-700 mt-1">
                            {lang === 'ko' 
                              ? '오류 뱃지를 클릭하면 상세 정보를 확인할 수 있습니다.'
                              : 'Click on error badges to view detailed information.'
                            }
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.keys(analysisStatus)
                              .filter(key => analysisStatus[Number(key)]?.status === 'error')
                              .slice(0, 5)
                              .map(key => {
                                const item = mainData.find(d => d.연번 === Number(key))
                                if (!item) return null
                                return (
                                  <button
                                    key={key}
                                    onClick={() => handleErrorClick(item)}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                  >
                                    #{item.연번} - {(item.AI_H지수_프롬프터 || '').substring(0, 20)}...
                                  </button>
                                )
                              })
                            }
                            {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'error').length > 5 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs text-red-600">
                                {lang === 'ko' ? '외' : 'and'} {Object.keys(analysisStatus).filter(key => analysisStatus[Number(key)]?.status === 'error').length - 5}{lang === 'ko' ? '개' : ' more'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                        ? `${lang === 'ko' ? '선택된 카테고리' : 'Selected Categories'}: ${selectedCategories.length}`
                        : `${t('SelectedItems')}: ${selectedItems.length}`
                      }
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        {t('SelectAll')}
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {t('ClearAll')}
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
                                <span className="font-semibold text-gray-900 text-lg">{translateCategory(category)}</span>
                                <div className="text-sm text-gray-500 mt-1">{items.length} {t('items')}</div>
                              </div>
                            </label>
                          </div>
                          
                          <div className="ml-8 space-y-3">
                            {items.map((item) => (
                              <div key={`category-item-${category}-${item.연번}-${item.id}`} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-gray-600 leading-relaxed">
                                    {getTranslatedAnalysisItem(item)}
                                  </div>
                                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                    <span>{t('Weight')}: {item.가중치?.toFixed(2) || '0.00'}</span>
                                    <span>|</span>
                                    {item.분야 && (
                                      <>
                                        <span>{translateField(item.분야)}</span>
                                        <span>|</span>
                                      </>
                                    )}
                                    <span>{t('Item')} #{item.연번}</span>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  {/* 분석 상태 뱃지 */}
                                  {analysisStatus[item.연번] && (
                                    <div className="flex items-center space-x-2">
                                      <span 
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        analysisStatus[item.연번]?.status === 'success'
                                          ? 'bg-success-100 text-success-800'
                                          : analysisStatus[item.연번]?.status === 'error'
                                          ? 'bg-error-100 text-error-800 cursor-pointer hover:bg-error-200 transition-colors'
                                          : 'bg-warning-100 text-warning-800'
                                      }`}
                                        onClick={() => analysisStatus[item.연번]?.status === 'error' && handleErrorClick(item)}
                                        title={analysisStatus[item.연번]?.status === 'error' ? (lang === 'ko' ? '클릭하여 오류 상세 정보 보기' : 'Click to view error details') : ''}
                                      >
                                        {analysisStatus[item.연번]?.status === 'success' && (lang === 'ko' ? '✓ 성공' : '✓ Success')}
                                        {analysisStatus[item.연번]?.status === 'error' && (lang === 'ko' ? '✗ 오류' : '✗ Error')}
                                        {analysisStatus[item.연번]?.status === 'pending' && (lang === 'ko' ? '⏳ 진행중' : '⏳ Processing')}
                                      </span>
                                      {/* 성공 시 AI_H지수 표시 */}
                                      {analysisStatus[item.연번]?.status === 'success' && (
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
                        <div key={`item-selection-${item.연번}-${item.id}`} className="border border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors">
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
                                  <span className="font-semibold text-gray-900 text-lg">{t('Item')} #{item.연번}</span>
                                  <span className="text-sm text-gray-500">({getTranslatedCategory(item)})</span>
                                  {item.분야 && (
                                    <>
                                      <span className="text-sm text-gray-500">|</span>
                                      <span className="text-sm text-gray-500">{translateField(item.분야)}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed mb-2">
                                  {getTranslatedAnalysisItem(item)}
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <span>가중치: {item.가중치?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                            </label>
                            <div className="ml-4 flex-shrink-0">
                              {/* 분석 상태 뱃지 */}
                              {analysisStatus[item.연번] && (
                                <div className="flex items-center space-x-2">
                                  <span 
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    analysisStatus[item.연번]?.status === 'success'
                                      ? 'bg-success-100 text-success-800'
                                      : analysisStatus[item.연번]?.status === 'error'
                                      ? 'bg-error-100 text-error-800 cursor-pointer hover:bg-error-200 transition-colors'
                                      : 'bg-warning-100 text-warning-800'
                                  }`}
                                    onClick={() => analysisStatus[item.연번]?.status === 'error' && handleErrorClick(item)}
                                    title={analysisStatus[item.연번]?.status === 'error' ? (lang === 'ko' ? '클릭하여 오류 상세 정보 보기' : 'Click to view error details') : ''}
                                  >
                                    {analysisStatus[item.연번]?.status === 'success' && '✓ 성공'}
                                    {analysisStatus[item.연번]?.status === 'error' && '✗ 오류'}
                                    {analysisStatus[item.연번]?.status === 'pending' && '⏳ 진행중'}
                                  </span>
                                  {/* 성공 시 AI_H지수 표시 */}
                                  {analysisStatus[item.연번]?.status === 'success' && (
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
                              <span className="font-medium text-gray-900">{translateCategory(category)}</span>
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
                              <div key={`selected-item-${itemNumber}`} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">항목 {itemNumber}</span>
                                  <span className="text-sm text-gray-500">{item.분야}</span>
                                </div>
                                <div className="text-sm text-gray-600 truncate">
                                  {getTranslatedAnalysisItem(item)}
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
                  {t('SelectedItems')}: {getSelectedCount()}
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="btn-secondary"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={startAnalysis}
                    disabled={getSelectedCount() === 0 || loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('Analyzing...')}</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        <span>{t('StartAnalysis')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      {/* Error Detail Modal */}
      <ErrorDetailModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false)
          setSelectedError(null)
        }}
        errorData={selectedError}
        lang={lang}
      />
    </div>
  )
} 