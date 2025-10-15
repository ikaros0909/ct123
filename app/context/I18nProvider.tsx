"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'ko' | 'en' | 'ja' | 'zh'

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const dict: Record<string, { ko: string; en: string; ja: string; zh: string }> = {
  'Join': { ko: '회원가입', en: 'Join', ja: '会員登録', zh: '注册' },
  'Analyze': { ko: 'AI 분석', en: 'AI Analysis', ja: 'AI分析', zh: 'AI分析' },
  'Analyzing...': { ko: 'AI 분석 중...', en: 'AI Analyzing...', ja: 'AI分析中...', zh: 'AI分析中...' },
  'Subtitle': {
    ko: '시간 게이팅 기반 AI 복합/서브지수 평가',
    en: 'AI-driven composite and sub-index evaluation with time-gated access windows',
    ja: 'タイムゲーティングベースのAI複合/サブ指数評価',
    zh: '基于时间门控的AI复合/子指数评估'
  },
  'SelectCompany': { ko: '기업을 선택하세요', en: 'Select a Company', ja: '企業を選択してください', zh: '请选择公司' },
  'SelectedCompany': { ko: '선택된 기업:', en: 'Selected Company:', ja: '選択された企業:', zh: '选定的公司:' },
  'ShowMore': { ko: '더보기', en: 'Show More', ja: 'もっと見る', zh: '查看更多' },
  'ShowLess': { ko: '접기', en: 'Show Less', ja: '折りたたむ', zh: '收起' },
  'Admin': { ko: '관리자', en: 'Admin', ja: '管理者', zh: '管理员' },
  'User': { ko: '사용자', en: 'User', ja: 'ユーザー', zh: '用户' },
  'Manage': { ko: '관리', en: 'Manage', ja: '管理', zh: '管理' },
  'Login': { ko: '로그인', en: 'Login', ja: 'ログイン', zh: '登录' },
  'Logout': { ko: '로그아웃', en: 'Logout', ja: 'ログアウト', zh: '登出' },
  'AdminDashboard': { ko: '관리자 대시보드', en: 'Admin Dashboard', ja: '管理者ダッシュボード', zh: '管理员仪表板' },
  'AccountSettings': { ko: '계정 설정', en: 'Account Settings', ja: 'アカウント設定', zh: '账户设置' },
  'Analysis': { ko: '분석', en: 'Analysis', ja: '分析', zh: '分析' },
  'Results': { ko: '결과', en: 'Results', ja: '結果', zh: '结果' },
  'CompositeIndexTrend': { ko: '복합 지수 추세', en: 'Composite Index Trend', ja: '複合指数トレンド', zh: '复合指数趋势' },
  'CategoryAnalysis': { ko: '카테고리별 분석', en: 'Category Analysis', ja: 'カテゴリ別分析', zh: '分类分析' },
  'DetailedAnalysis': { ko: '상세 분석', en: 'Detailed Analysis', ja: '詳細分析', zh: '详细分析' },
  'Date': { ko: '날짜', en: 'Date', ja: '日付', zh: '日期' },
  'Category': { ko: '카테고리', en: 'Category', ja: 'カテゴリ', zh: '类别' },
  'Item': { ko: '항목', en: 'Item', ja: '項目', zh: '项目' },
  'Weight': { ko: '가중치', en: 'Weight', ja: '重み', zh: '权重' },
  'Score': { ko: '점수', en: 'Score', ja: 'スコア', zh: '分数' },
  'WeightedScore': { ko: '가중치 점수', en: 'Weighted Score', ja: '加重スコア', zh: '加权分数' },
  'AnalysisDate': { ko: '분석 날짜', en: 'Analysis Date', ja: '分析日', zh: '分析日期' },
  'TotalItems': { ko: '전체 항목', en: 'Total Items', ja: '総項目', zh: '总项目' },
  'CurrentIndex': { ko: '현재 지수', en: 'Current Index', ja: '現在の指数', zh: '当前指数' },
  'items': { ko: '개 항목', en: ' items', ja: '項目', zh: '项' },
  'more': { ko: '개', en: '', ja: '', zh: '个' },
  'YearsAgo': { ko: '년전', en: ' years ago', ja: '年前', zh: '年前' },
  'MonthsAgo': { ko: '개월전', en: ' months ago', ja: 'ヶ月前', zh: '个月前' },
  'DaysAgo': { ko: '일전', en: ' days ago', ja: '日前', zh: '天前' },
  'Yesterday': { ko: '어제', en: 'Yesterday', ja: '昨日', zh: '昨天' },
  'Today': { ko: '오늘', en: 'Today', ja: '今日', zh: '今天' },
  'Current': { ko: '현재', en: 'Current', ja: '現在', zh: '当前' },
  // Reports
  'NowReport': { ko: 'Now 리포트', en: 'Now Report', ja: 'Nowレポート', zh: 'Now报告' },
  'InsightReport': { ko: 'Insight 리포트', en: 'Insight Report', ja: 'Insightレポート', zh: 'Insight报告' },
  'SubIndexTrend': { ko: '서브지수 추세', en: 'Sub-index Trend', ja: 'サブ指数トレンド', zh: '子指数趋势' },
  'CompanySummary': { ko: '기업 요약', en: 'Company Summary', ja: '企業概要', zh: '公司摘要' },
  // AI Analysis Modal
  'SelectAnalysisItems': { ko: '분석 항목 선택', en: 'Select Analysis Items', ja: '分析項目を選択', zh: '选择分析项目' },
  'SelectItemsToAnalyze': { ko: '분석할 항목을 선택해주세요', en: 'Please select items to analyze', ja: '分析する項目を選択してください', zh: '请选择要分析的项目' },
  'SelectionMode': { ko: '선택 모드:', en: 'Selection Mode:', ja: '選択モード:', zh: '选择模式:' },
  'ByCategory': { ko: '카테고리별', en: 'By Category', ja: 'カテゴリ別', zh: '按类别' },
  'ByItem': { ko: '항목별', en: 'By Item', ja: '項目別', zh: '按项目' },
  'AnalysisInProgress': { ko: 'AI 분석 진행 중...', en: 'AI Analysis in Progress...', ja: 'AI分析進行中...', zh: 'AI分析进行中...' },
  'ItemsInProgress': { ko: '분석 중인 항목:', en: 'Items in Progress:', ja: '分析中の項目:', zh: '进行中的项目:' },
  'ItemsCompleted': { ko: '완료된 항목:', en: 'Items Completed:', ja: '完了した項目:', zh: '已完成的项目:' },
  'SelectAll': { ko: '전체 선택', en: 'Select All', ja: 'すべて選択', zh: '全选' },
  'ClearAll': { ko: '전체 해제', en: 'Clear All', ja: 'すべて解除', zh: '全部清除' },
  'SelectedItems': { ko: '선택된 항목:', en: 'Selected Items:', ja: '選択された項目:', zh: '已选项目:' },
  'StartAnalysis': { ko: '분석 시작', en: 'Start Analysis', ja: '分析開始', zh: '开始分析' },
  'Cancel': { ko: '취소', en: 'Cancel', ja: 'キャンセル', zh: '取消' },
  'NoDataAvailable': { ko: '데이터가 없습니다', en: 'No data available', ja: 'データがありません', zh: '无数据' },
  'PleaseSelectCategory': { ko: '카테고리를 선택해주세요', en: 'Please select a category', ja: 'カテゴリを選択してください', zh: '请选择类别' },
  'PleaseSelectItems': { ko: '항목을 선택해주세요', en: 'Please select items', ja: '項目を選択してください', zh: '请选择项目' },
  // Matrix headers
  'ItemPrompt': { ko: 'AI_H지수 프롬프터', en: 'AI_H Index Prompt', ja: 'AI_H指数プロンプタ', zh: 'AI_H指数提示器' },
  'LastDays': { ko: '최근 5일', en: 'Last 5 Days', ja: '最近5日間', zh: '最近5天' },
  'AvgScore': { ko: '평균', en: 'Avg', ja: '平均', zh: '平均' },
  // Company Summary fields
  'TotalAnalysisItems': { ko: '총 분석 항목', en: 'Total Analysis Items', ja: '総分析項目', zh: '总分析项目' },
  'LastAnalysisDate': { ko: '최근 분석 날짜', en: 'Last Analysis Date', ja: '最終分析日', zh: '最后分析日期' },
  'AverageScore': { ko: '평균 점수', en: 'Average Score', ja: '平均スコア', zh: '平均分数' },
  'TrendDirection': { ko: '추세 방향', en: 'Trend Direction', ja: 'トレンド方向', zh: '趋势方向' },
  'Positive': { ko: '긍정적', en: 'Positive', ja: 'ポジティブ', zh: '积极' },
  'Negative': { ko: '부정적', en: 'Negative', ja: 'ネガティブ', zh: '消极' },
  'Neutral': { ko: '중립', en: 'Neutral', ja: '中立', zh: '中性' },
  'Rising': { ko: '상승', en: 'Rising', ja: '上昇', zh: '上升' },
  'Falling': { ko: '하락', en: 'Falling', ja: '下降', zh: '下降' },
  'Stable': { ko: '안정', en: 'Stable', ja: '安定', zh: '稳定' }
}

const Ctx = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }){
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null
    if (saved === 'ko' || saved === 'en' || saved === 'ja' || saved === 'zh') {
      setLangState(saved)
      return
    }
    // Browser language detection
    const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
    if (nav.startsWith('ko')) {
      setLangState('ko')
    } else if (nav.startsWith('ja')) {
      setLangState('ja')
    } else if (nav.startsWith('zh')) {
      setLangState('zh')
    } else {
      setLangState('en')
    }
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
