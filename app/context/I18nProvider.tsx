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
  'Analyze': { ko: 'AI 분석', en: 'Analyze' },
  'Analyzing...': { ko: '분석 중...', en: 'Analyzing...' },
  'Subtitle': {
    ko: '시간 게이팅 기반 AI 복합/서브지수 평가',
    en: 'AI-driven composite and sub-index evaluation with time-gated access windows'
  }
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
