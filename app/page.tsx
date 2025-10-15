'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Calendar, Zap, LogOut, User } from 'lucide-react'
import { useI18n } from './context/I18nProvider'
import AuthModal from './components/AuthModal'
import ErrorDetailModal from './components/ErrorDetailModal'
import AnalysisModal from './components/AnalysisModal'
import Footer from '../src/components/user/Footer'
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
  // 한국 시간 기준 오늘 날짜 계산 (간단한 방식)
  const getKoreanToday = () => {
    const now = new Date()
    // UTC 시간에 9시간 더하기
    now.setHours(now.getHours() + 9)
    return now.toISOString().split('T')[0]
  }
  
  const [selectedDate, setSelectedDate] = useState(getKoreanToday())
  const [currentDate, setCurrentDate] = useState(getKoreanToday())
  const [matrixFilter, setMatrixFilter] = useState('all')
  const [matrixSort, setMatrixSort] = useState('number')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState<Record<number, any>>({})
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showAnalysisConfirmModal, setShowAnalysisConfirmModal] = useState(false)
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetailedLog, setShowDetailedLog] = useState(false)
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
  const [reports, setReports] = useState<any[]>([]) // 리포트 데이터 상태 추가
  const [lastUpdated, setLastUpdated] = useState<string>('') // 마지막 업데이트 시간 상태 추가

  useEffect(() => {
    // 날짜는 이미 useState에서 초기화됨
    
    // 마지막 업데이트 시간 설정 (클라이언트 사이드에서만)
    setLastUpdated(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }))
    
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

  // 선택된 날짜가 변경되면 리포트 로드
  useEffect(() => {
    if (selectedCompany && selectedDate) {
      loadReports()
    }
  }, [selectedCompany, selectedDate])

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded companies:', data.length, data)
        setCompanies(data)
        // 첫 번째 기업을 기본으로 선택
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0])
        }
      } else {
        console.error('Failed to load companies:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('기업 목록 로드 실패:', error)
    }
  }

  const loadReports = async () => {
    if (!selectedCompany || !selectedDate) return
    
    try {
      const response = await fetch(`/api/reports?companyId=${selectedCompany.id}&date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        console.error('리포트 로드 실패:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('리포트 로드 오류:', error)
    }
  }

  const loadData = async () => {
    if (!selectedCompany) return

    setLoading(true)
    try {
      // 선택된 기업의 데이터 로드
      const [mainDataResponse, analysisDataResponse] = await Promise.all([
        api.getSamsungMain(selectedCompany.id),
        api.getSamsungAnalysis(selectedCompany.id)
      ])

      console.log('Main data loaded:', mainDataResponse.length, 'items')
      console.log('Analysis data loaded:', analysisDataResponse.length, 'items')

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
        source: item.source,
        // 다국어 필드도 보관
        itemEn: item.itemEn,
        itemJa: item.itemJa,
        itemZh: item.itemZh,
        questionEn: item.questionEn,
        questionJa: item.questionJa,
        questionZh: item.questionZh,
        categoryEn: item.categoryEn,
        categoryJa: item.categoryJa,
        categoryZh: item.categoryZh
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


      setMainData(transformedMainData)
      setAnalysisData(transformedAnalysisData)
      console.log('Data state updated successfully')
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
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
    
    setShowAnalysisConfirmModal(true)
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisLogs([])
    setAnalysisCompleted(false)
    setShowDetailedLog(true)
    setAnalysisProgress(0)
    setAnalysisStatus({})
    setLoading(true)
    
    const addLog = (message: string) => {
      setAnalysisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }
    
    // 총 분석할 항목 수 계산
    const totalItems = mainData.length
    
    addLog(`분석 시작: 총 ${totalItems}개 항목`)
    addLog(`선택한 날짜: ${selectedDate}`)
    addLog(`대상 기업: ${selectedCompany?.nameKr || selectedCompany?.name}`)
    
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
      addLog('서버에 분석 요청 전송 중...')
      
      const result = await api.analyze({ 
        date: selectedDate,
        categories: selectedCategories,
        items: mainData.map(item => item.연번),
        selectionMode: 'all',
        companyId: selectedCompany?.id
      })
      
      // 시뮬레이션 중단
      clearInterval(progressInterval)
      
      // 진행 상황을 100%로 설정
      setAnalysisProgress(100)
      addLog('분석 완료!')
      
      // 상태 업데이트
      if (result.status) {
        setAnalysisStatus(result.status)
      }
      
      if (result.success) {
        await loadData()
        await loadReports() // 분석 완료 후 리포트도 다시 로드
        setAnalysisCompleted(true)
        addLog('데이터 로드 완료')
      }
    } catch (error: any) {
      console.error('분석 중 오류:', error)
      clearInterval(progressInterval)
      
      // 오류 메시지 표시
      const errorMessage = error?.response?.data?.details || error?.message || '분석 중 오류가 발생했습니다.'
      addLog(`오류 발생: ${errorMessage}`)
      
      // 오류 상태 표시
      if (error?.response?.data?.status) {
        setAnalysisStatus(error.response.data.status)
      }
    } finally {
      setIsAnalyzing(false)
      setLoading(false)
      // 2초 후 모달 닫기 (분석 완료 시)
      setTimeout(() => {
        setAnalysisProgress(0)
      }, 2000)
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
  const groupedData = analysisData.reduce((acc: Record<string, SamsungAnalysisData[]>, item) => {
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
  const getTranslatedAnalysisItem = (item: any): string => {
    const base = item.AI_H지수_프롬프터 || item.item || item.question || ''

    if (lang === 'ko') {
      return base
    } else if (lang === 'en') {
      return item.itemEn || item.questionEn || base
    } else if (lang === 'ja') {
      // 일본어가 없으면 한국어로만 폴백 (영어 건너뜀)
      return item.itemJa || item.questionJa || base
    } else if (lang === 'zh') {
      // 중국어가 없으면 한국어로만 폴백 (영어 건너뜀)
      return item.itemZh || item.questionZh || base
    }
    return base
  }

  // Get translated category from database
  const getTranslatedCategory = (item: any): string => {
    const base = item.구분 || item.category || ''

    if (lang === 'ko') {
      return base
    } else if (lang === 'en') {
      return item.categoryEn || translateCategory(base)
    } else if (lang === 'ja') {
      // 일본어가 없으면 한국어로만 폴백
      return item.categoryJa || base
    } else if (lang === 'zh') {
      // 중국어가 없으면 한국어로만 폴백
      return item.categoryZh || base
    }
    return base
  }

  const groupedByCategory = mainData.reduce((acc: Record<string, SamsungMainData[]>, item) => {
    if (!acc[item.구분]) {
      acc[item.구분] = []
    }
    acc[item.구분].push(item)
    return acc
  }, {} as Record<string, SamsungMainData[]>)

  // 분야별 데이터 그룹화
  const groupedByField = mainData.reduce((acc: Record<string, SamsungMainData[]>, item) => {
    if (!acc[item.분야]) {
      acc[item.분야] = []
    }
    acc[item.분야].push(item)
    return acc
  }, {} as Record<string, SamsungMainData[]>)

  // 매트릭스용 필터링된 데이터
  let filteredMatrixData = [...mainData]
  
  // Apply filtering
  if (matrixFilter === 'category') {
    const categories = Object.keys(groupedByCategory)
    if (categories.length > 0) {
      filteredMatrixData = groupedByCategory[categories[0]] || []
    }
  } else if (matrixFilter === 'field') {
    const fields = Object.keys(groupedByField)
    if (fields.length > 0) {
      filteredMatrixData = groupedByField[fields[0]] || []
    }
  }
  
  // Apply sorting
  if (matrixSort === 'weight') {
    filteredMatrixData.sort((a, b) => b.가중치 - a.가중치);
  } else if (matrixSort === 'score') {
    filteredMatrixData.sort((a, b) => {
      const aScore = analysisData.find(item => Number(item.연번) === Number(a.연번))?.AI_H지수 || 0;
      const bScore = analysisData.find(item => Number(item.연번) === Number(b.연번))?.AI_H지수 || 0;
      return bScore - aScore;
    });
  } else {
    filteredMatrixData.sort((a, b) => a.연번 - b.연번);
  }

  // Simple data preparation for display
  const kstNow = new Date();
  const fmtMDY = kstNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Create avgByDate map
  const avgByDate = new Map<string, number>();
  for (let i = 0; i < averageData.length; i++) {
    avgByDate.set(averageData[i].날짜, averageData[i].평균AI_H지수);
  }
  
  // Create simplePoints array
  const simplePoints: any[] = [];
  const startIdx = Math.max(0, averageData.length - 7);
  for (let i = startIdx; i < averageData.length; i++) {
    simplePoints.push({
      label: averageData[i].날짜,
      value: averageData[i].평균AI_H지수
    });
  }
  
  // Reports display
  let nowReport: any = null;
  let insightReport: any = null;
  for (let i = 0; i < reports.length; i++) {
    if (reports[i].type === 'NOW') {
      nowReport = reports[i];
    }
    if (reports[i].type === 'INSIGHT') {
      insightReport = reports[i];
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-8 gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">AI Corporate Competitiveness Diagnosis</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{t('Subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              {/* 언어 선택 */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setLang('ko')}
                  className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
                    lang === 'ko'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                    lang === 'en'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('ja')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                    lang === 'ja'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  日本語
                </button>
                <button
                  onClick={() => setLang('zh')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
                    lang === 'zh'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  中文
                </button>
              </div>
              
              {/* 사용자 메뉴 */}
              {isAuthenticated ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">{user?.name || user?.email}</span>
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
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 text-xs sm:text-sm font-medium transition-all transform hover:scale-105"
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
		<div className="mb-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
			{(showAllCompanies ? companies : companies.slice(0, 5)).map((company) => (
				<button
					key={company.id}
					onClick={() => setSelectedCompany(company)}
					className={`px-2 sm:px-3 py-1 sm:py-1.5 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
					className="px-2 sm:px-3 py-1 sm:py-1.5 border border-dashed border-gray-400 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-600 transition-colors flex items-center gap-1"
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
					className="px-2 sm:px-3 py-1 sm:py-1.5 border border-purple-400 rounded-lg hover:bg-purple-50 text-xs sm:text-sm font-medium text-purple-600 transition-colors flex items-center gap-1"
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
			<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
				<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
					<span className="text-xs sm:text-sm font-medium text-gray-700">{t('SelectedCompany')}</span>
					<span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs sm:text-sm font-semibold">
						{lang === 'ko' ? (selectedCompany.nameKr || selectedCompany.name) : (selectedCompany.name || selectedCompany.nameKr)}
					</span>
				</div>
				
				
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
					<div className="flex items-center space-x-2 w-full sm:w-auto">
						<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					
					<button
						onClick={handleAnalyze}
						disabled={loading || !selectedCompany}
						className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 text-xs sm:text-sm font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? (
							<div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						)}
						<span>{loading ? t('Analyzing...') : t('Analyze')}</span>
					</button>
				</div>
			</div>
		)}
		{/* Composite Index Trend one-liner */}
		{simplePoints.length > 0 && (
			<div className="mb-6 text-xs sm:text-sm">
				<div className="px-2 sm:px-3 py-2 border rounded bg-white">
					<div className="font-medium mb-1 sm:mb-0 sm:inline sm:mr-2">{t('CompositeIndexTrend')} : As of 10:00, {fmtMDY}</div>
					<div className="text-gray-700 flex flex-wrap gap-2 sm:inline">
						{simplePoints.slice(-3).map((p, i) => (
							<span key={p.label} className="sm:mr-3">
								{p.label}: {p.value.toFixed(2)}
							</span>
						))}
					</div>
				</div>
			</div>
		)}
        {/* Charts */}
        <div className="mb-8">
          {/* AI_H지수 트렌드 */}
          <div className="card p-3 sm:p-6">
            <>
              <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">{t('CompositeIndexTrend')} : As of 10:00, {fmtMDY}</div>
              {loading ? (
                <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? '데이터 로딩 중...' : 'Loading data...'}</p>
                  </div>
                </div>
              ) : simplePoints.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <LineChart data={simplePoints}>
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
                <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-xs sm:text-sm">{lang === 'ko' ? '분석 데이터가 없습니다' : 'No analysis data available'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      {lang === 'ko' ? 'AI 분석을 실행하여 데이터를 생성해주세요' : 'Please run AI analysis to generate data'}
                    </p>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>

        {/* Insight, Now report (below chart) */}
        <div className="mb-8">
          <div className="card p-3 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? '데이터 로딩 중...' : 'Loading data...'}</p>
                </div>
              </div>
            ) : insightReport || nowReport ? (
              <div className="space-y-6">
                {insightReport && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t('InsightReport')}</h4>
                    <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 bg-blue-50 p-3 sm:p-4 rounded-lg">
                      {lang === 'ko' ? insightReport.content : (insightReport.contentEn || insightReport.content)}
                    </div>
                  </div>
                )}
                {nowReport && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t('NowReport')}</h4>
                    <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg">
                      {lang === 'ko' ? nowReport.content : (nowReport.contentEn || nowReport.content)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs sm:text-sm">{lang === 'ko' ? '분석 리포트가 없습니다' : 'No analysis reports available'}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  {lang === 'ko' ? 'AI 분석을 실행하여 리포트를 생성해주세요' : 'Please run AI analysis to generate reports'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Matrix (moved below Insight) */}
        <div className="mt-8">
          <div className="card overflow-hidden">
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                {t('SubIndexTrend')} : As of 10:00, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? '데이터 로딩 중...' : 'Loading data...'}</p>
                </div>
              </div>
            ) : (
            <div>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-10 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
                      {t('Item')}
                    </th>
                    {Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 5).map((date) => (
                      <th key={date} className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMatrixData.slice(0, showMoreItems).map((item, index) => {
                    const analysisResults = Object.keys(groupedData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 5).map(date => {
                      const dateResults = groupedData[date] || []
                      const result = dateResults.find(result => Number(result?.연번) === Number(item.연번)) || null
                      return result
                    })

                    return (
                    <tr key={`matrix-row-${item.연번}-${item.id}`} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-white border-r border-gray-200">
                        <div className="space-y-0.5 sm:space-y-1 min-w-[180px] sm:min-w-[220px]">
                          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary-100 text-primary-800 whitespace-nowrap">
                              {t('Item')} {item.연번}
                            </span>
                            <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-900">{translateField(item.분야)}</span>
                            {analysisStatus[item.연번] && (
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <span 
                                  className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
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
                                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${
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
                          <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                            {getTranslatedAnalysisItem(item)}
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 text-[9px] sm:text-xs flex-wrap">
                            <span className="text-gray-600 whitespace-nowrap">{t('Weight')}: ***</span>
                            <span className="text-gray-400 hidden sm:inline">|</span>
                            <span className="text-gray-600 truncate max-w-[100px] sm:max-w-none">{getTranslatedCategory(item)}</span>
                            <span className="text-gray-400 hidden sm:inline">|</span>
                            <span className="text-gray-600 whitespace-nowrap">{t('Item')}: {item.연번}</span>
                          </div>
                        </div>
                      </td>

                      {analysisResults.map((result, dateIndex) => (
                        <td key={dateIndex} className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center border-r border-gray-200">
                          {result ? (
                            <div className="space-y-1 sm:space-y-2">
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                                  result.AI_H지수 > 0 
                                    ? 'bg-success-100 text-success-800 border border-success-200' 
                                    : result.AI_H지수 < 0 
                                    ? 'bg-error-100 text-error-800 border border-error-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {result.AI_H지수}
                                </span>
                              </div>
                              <div className={`text-[10px] sm:text-xs font-medium ${
                                result.지수X가중치 > 0 ? 'text-success-600' : 
                                result.지수X가중치 < 0 ? 'text-error-600' : 'text-gray-600'
                              }`}>
                                {result.지수X가중치.toFixed(1)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs sm:text-sm">-</div>
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
            {filteredMatrixData.length > showMoreItems && (
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowMoreItems(prev => prev + 10)}
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>{t('ShowMore')} ({filteredMatrixData.length - showMoreItems} {t('more')} {t('items')})</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            </div>
            )}
          </div>
        </div>

        {/* Company Summary */}
        <div className="mt-8">
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t('CompanySummary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{t('SelectedCompany').replace(':', '')}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {lang === 'ko' ? (selectedCompany?.nameKr || selectedCompany?.name) : (selectedCompany?.name || selectedCompany?.nameKr) || t('SelectCompany')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{lang === 'ko' ? '산업' : 'Industry'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? '기술 / 전자' : 'Technology / Electronics'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{lang === 'ko' ? '시가총액' : 'Market Cap'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">$400B+</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{t('AnalysisDate')}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedDate}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{t('TotalAnalysisItems')}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{mainData.length} {t('items')}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{t('CurrentIndex')}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {averageData.length > 0 ? averageData[averageData.length - 1].평균AI_H지수.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{lang === 'ko' ? '분석 상태' : 'Analysis Status'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? '활성' : 'Active'}</p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{lang === 'ko' ? '최근 업데이트' : 'Last Updated'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {lastUpdated || (lang === 'ko' ? '로딩 중...' : 'Loading...')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{lang === 'ko' ? '데이터 소스' : 'Data Source'}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ko' ? 'AI 분석 엔진' : 'AI Analysis Engine'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



      </main>

      {/* Footer Component */}
      <Footer />

      {/* AI Analysis Confirmation Modal */}
      <AnalysisModal
        show={showAnalysisConfirmModal}
        onClose={() => {
          if (!isAnalyzing) {
            setShowAnalysisConfirmModal(false)
            setShowDetailedLog(false)
            setAnalysisLogs([])
            setAnalysisCompleted(false)
          }
        }}
        onConfirm={startAnalysis}
        isAnalyzing={isAnalyzing}
        analysisCompleted={analysisCompleted}
        analysisLogs={analysisLogs}
        analysisProgress={analysisProgress}
        selectedDate={selectedDate}
        companyName={selectedCompany?.nameKr || selectedCompany?.name || ''}
        itemCount={mainData.length}
        showDetailedLog={showDetailedLog}
      />


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