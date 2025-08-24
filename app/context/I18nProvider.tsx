"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'ko' | 'en'

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const dict: Record<string, { ko: string; en: string }> = {
  'Join': { ko: '회원가입', en: 'Join' },
  'Analyze': { ko: 'AI 분석', en: 'AI Analysis' },
  'Analyzing...': { ko: 'AI 분석 중...', en: 'AI Analyzing...' },
  'Subtitle': {
    ko: '시간 게이팅 기반 AI 복합/서브지수 평가',
    en: 'AI-driven composite and sub-index evaluation with time-gated access windows'
  },
  'SelectCompany': { ko: '기업을 선택하세요', en: 'Select a Company' },
  'SelectedCompany': { ko: '선택된 기업:', en: 'Selected Company:' },
  'ShowMore': { ko: '더보기', en: 'Show More' },
  'ShowLess': { ko: '접기', en: 'Show Less' },
  'Admin': { ko: '관리자', en: 'Admin' },
  'User': { ko: '사용자', en: 'User' },
  'Manage': { ko: '관리', en: 'Manage' },
  'Login': { ko: '로그인', en: 'Login' },
  'Logout': { ko: '로그아웃', en: 'Logout' },
  'AdminDashboard': { ko: '관리자 대시보드', en: 'Admin Dashboard' },
  'AccountSettings': { ko: '계정 설정', en: 'Account Settings' },
  'Analysis': { ko: '분석', en: 'Analysis' },
  'Results': { ko: '결과', en: 'Results' },
  'CompositeIndexTrend': { ko: '복합 지수 추세', en: 'Composite Index Trend' },
  'CategoryAnalysis': { ko: '카테고리별 분석', en: 'Category Analysis' },
  'DetailedAnalysis': { ko: '상세 분석', en: 'Detailed Analysis' },
  'Date': { ko: '날짜', en: 'Date' },
  'Category': { ko: '카테고리', en: 'Category' },
  'Item': { ko: '항목', en: 'Item' },
  'Weight': { ko: '가중치', en: 'Weight' },
  'Score': { ko: '점수', en: 'Score' },
  'WeightedScore': { ko: '가중치 점수', en: 'Weighted Score' },
  'AnalysisDate': { ko: '분석 날짜', en: 'Analysis Date' },
  'TotalItems': { ko: '전체 항목', en: 'Total Items' },
  'CurrentIndex': { ko: '현재 지수', en: 'Current Index' },
  'items': { ko: '개 항목', en: ' items' },
  'more': { ko: '개', en: '' },
  'YearsAgo': { ko: '년전', en: ' years ago' },
  'MonthsAgo': { ko: '개월전', en: ' months ago' },
  'DaysAgo': { ko: '일전', en: ' days ago' },
  'Yesterday': { ko: '어제', en: 'Yesterday' },
  'Today': { ko: '오늘', en: 'Today' },
  'Current': { ko: '현재', en: 'Current' },
  // Reports
  'NowReport': { ko: 'Now 리포트', en: 'Now Report' },
  'InsightReport': { ko: 'Insight 리포트', en: 'Insight Report' },
  'SubIndexTrend': { ko: '서브지수 추세', en: 'Sub-index Trend' },
  'CompanySummary': { ko: '기업 요약', en: 'Company Summary' },
  // AI Analysis Modal
  'SelectAnalysisItems': { ko: '분석 항목 선택', en: 'Select Analysis Items' },
  'SelectItemsToAnalyze': { ko: '분석할 항목을 선택해주세요', en: 'Please select items to analyze' },
  'SelectionMode': { ko: '선택 모드:', en: 'Selection Mode:' },
  'ByCategory': { ko: '카테고리별', en: 'By Category' },
  'ByItem': { ko: '항목별', en: 'By Item' },
  'AnalysisInProgress': { ko: 'AI 분석 진행 중...', en: 'AI Analysis in Progress...' },
  'ItemsInProgress': { ko: '분석 중인 항목:', en: 'Items in Progress:' },
  'ItemsCompleted': { ko: '완료된 항목:', en: 'Items Completed:' },
  'SelectAll': { ko: '전체 선택', en: 'Select All' },
  'ClearAll': { ko: '전체 해제', en: 'Clear All' },
  'SelectedItems': { ko: '선택된 항목:', en: 'Selected Items:' },
  'StartAnalysis': { ko: '분석 시작', en: 'Start Analysis' },
  'Cancel': { ko: '취소', en: 'Cancel' },
  'NoDataAvailable': { ko: '데이터가 없습니다', en: 'No data available' },
  'PleaseSelectCategory': { ko: '카테고리를 선택해주세요', en: 'Please select a category' },
  'PleaseSelectItems': { ko: '항목을 선택해주세요', en: 'Please select items' },
  // Matrix headers
  'ItemPrompt': { ko: 'AI_H지수 프롬프터', en: 'AI_H Index Prompt' },
  'LastDays': { ko: '최근 5일', en: 'Last 5 Days' },
  'AvgScore': { ko: '평균', en: 'Avg' },
  // Company Summary fields
  'TotalAnalysisItems': { ko: '총 분석 항목', en: 'Total Analysis Items' },
  'LastAnalysisDate': { ko: '최근 분석 날짜', en: 'Last Analysis Date' },
  'AverageScore': { ko: '평균 점수', en: 'Average Score' },
  'TrendDirection': { ko: '추세 방향', en: 'Trend Direction' },
  'Positive': { ko: '긍정적', en: 'Positive' },
  'Negative': { ko: '부정적', en: 'Negative' },
  'Neutral': { ko: '중립', en: 'Neutral' },
  'Rising': { ko: '상승', en: 'Rising' },
  'Falling': { ko: '하락', en: 'Falling' },
  'Stable': { ko: '안정', en: 'Stable' }
}

const Ctx = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }){
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null
    if (saved === 'ko' || saved === 'en') {
      setLangState(saved)
      return
    }
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
    setLangState(nav && nav.toLowerCase().startsWith('ko') ? 'ko' : 'en')
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch {}
  }

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (k) => dict[k]?.[lang] ?? k
  }), [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(){
  const v = useContext(Ctx)
  if(!v) throw new Error('useI18n must be used within I18nProvider')
  return v
}
