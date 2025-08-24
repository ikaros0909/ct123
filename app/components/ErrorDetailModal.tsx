'use client'

import React from 'react'
import { X, AlertTriangle, Info, Code, FileText, Calendar, Hash } from 'lucide-react'

interface ErrorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  errorData: {
    sequenceNumber?: number
    item?: string
    message?: string
    status?: string
    date?: string
    category?: string
  } | null
  lang: 'ko' | 'en'
}

export default function ErrorDetailModal({ 
  isOpen, 
  onClose, 
  errorData,
  lang 
}: ErrorDetailModalProps) {
  if (!isOpen || !errorData) return null

  const labels = {
    title: lang === 'ko' ? '오류 상세 정보' : 'Error Details',
    item: lang === 'ko' ? '분석 항목' : 'Analysis Item',
    errorMessage: lang === 'ko' ? '오류 메시지' : 'Error Message',
    itemNumber: lang === 'ko' ? '항목 번호' : 'Item Number',
    category: lang === 'ko' ? '카테고리' : 'Category',
    date: lang === 'ko' ? '발생 시간' : 'Occurred At',
    status: lang === 'ko' ? '상태' : 'Status',
    troubleshooting: lang === 'ko' ? '문제 해결 방법' : 'Troubleshooting',
    possibleCauses: lang === 'ko' ? '가능한 원인' : 'Possible Causes',
    suggestions: lang === 'ko' ? '제안사항' : 'Suggestions',
    close: lang === 'ko' ? '닫기' : 'Close',
    copyError: lang === 'ko' ? '오류 복사' : 'Copy Error',
    retry: lang === 'ko' ? '다시 시도' : 'Retry'
  }

  const getPossibleCauses = (message: string) => {
    const causes = []
    
    if (message?.includes('429') || message?.includes('quota')) {
      causes.push(lang === 'ko' 
        ? 'OpenAI API 사용 한도를 초과했습니다.'
        : 'OpenAI API usage quota has been exceeded.')
      causes.push(lang === 'ko'
        ? '현재 요금제의 월간/일간 한도에 도달했습니다.'
        : 'Monthly/daily limit of current plan has been reached.')
      causes.push(lang === 'ko'
        ? '결제 정보 또는 요금제 업그레이드가 필요할 수 있습니다.'
        : 'Billing information update or plan upgrade may be required.')
    } else if (message?.includes('API') || message?.includes('OpenAI')) {
      causes.push(lang === 'ko' 
        ? 'OpenAI API 키가 설정되지 않았거나 유효하지 않습니다.'
        : 'OpenAI API key is not set or invalid.')
      causes.push(lang === 'ko'
        ? 'API 요청 한도를 초과했을 수 있습니다.'
        : 'API request limit may have been exceeded.')
    }
    
    if (message?.includes('network') || message?.includes('timeout')) {
      causes.push(lang === 'ko'
        ? '네트워크 연결 문제가 발생했습니다.'
        : 'Network connection issue occurred.')
    }
    
    if (message?.includes('database') || message?.includes('prisma')) {
      causes.push(lang === 'ko'
        ? '데이터베이스 연결 오류입니다.'
        : 'Database connection error.')
    }
    
    if (causes.length === 0) {
      causes.push(lang === 'ko'
        ? '예상치 못한 시스템 오류가 발생했습니다.'
        : 'An unexpected system error occurred.')
    }
    
    return causes
  }

  const getSuggestions = (message: string) => {
    const suggestions = []
    
    if (message?.includes('429') || message?.includes('quota')) {
      suggestions.push(lang === 'ko'
        ? 'OpenAI 대시보드(https://platform.openai.com)에서 사용량을 확인하세요.'
        : 'Check usage at OpenAI dashboard (https://platform.openai.com).')
      suggestions.push(lang === 'ko'
        ? '결제 정보를 확인하고 필요시 크레딧을 충전하세요.'
        : 'Check billing information and add credits if needed.')
      suggestions.push(lang === 'ko'
        ? '요금제를 업그레이드하거나 다음 달까지 기다리세요.'
        : 'Upgrade your plan or wait until next month.')
      suggestions.push(lang === 'ko'
        ? '임시로 더미 데이터로 테스트할 수 있습니다.'
        : 'You can test with dummy data temporarily.')
    } else if (message?.includes('API') || message?.includes('OpenAI')) {
      suggestions.push(lang === 'ko'
        ? '환경 변수에서 OPENAI_API_KEY를 확인하세요.'
        : 'Check OPENAI_API_KEY in environment variables.')
      suggestions.push(lang === 'ko'
        ? 'OpenAI 대시보드에서 API 사용량을 확인하세요.'
        : 'Check API usage in OpenAI dashboard.')
    }
    
    if (message?.includes('network') || message?.includes('timeout')) {
      suggestions.push(lang === 'ko'
        ? '인터넷 연결을 확인하고 다시 시도하세요.'
        : 'Check internet connection and try again.')
    }
    
    suggestions.push(lang === 'ko'
      ? '문제가 지속되면 관리자에게 문의하세요.'
      : 'Contact administrator if the problem persists.')
    
    return suggestions
  }

  const copyErrorToClipboard = () => {
    const errorText = `
Error Details:
- Item: ${errorData.item || 'N/A'}
- Number: ${errorData.sequenceNumber || 'N/A'}
- Category: ${errorData.category || 'N/A'}
- Message: ${errorData.message || 'N/A'}
- Date: ${new Date().toISOString()}
    `.trim()
    
    navigator.clipboard.writeText(errorText)
    alert(lang === 'ko' ? '오류 정보가 복사되었습니다.' : 'Error information copied.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">{labels.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Error Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errorData.sequenceNumber && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{labels.itemNumber}</p>
                  <p className="font-semibold text-gray-900">{errorData.sequenceNumber}</p>
                </div>
              </div>
            )}
            
            {errorData.category && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{labels.category}</p>
                  <p className="font-semibold text-gray-900">{errorData.category}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
              <Info className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">{labels.item}</p>
                <p className="font-semibold text-gray-900 break-words">{errorData.item || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Code className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-red-800">{labels.errorMessage}</p>
                  {(errorData.message?.includes('429') || errorData.message?.includes('quota')) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {lang === 'ko' ? '할당량 초과' : 'Quota Exceeded'}
                    </span>
                  )}
                </div>
                <p className="text-red-700 font-mono text-sm break-all">
                  {errorData.message || 'Unknown error occurred'}
                </p>
                {(errorData.message?.includes('429') || errorData.message?.includes('quota')) && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      {lang === 'ko' 
                        ? '⚠️ OpenAI API 사용 한도를 초과했습니다. 결제 정보를 확인하거나 다음 달까지 기다려주세요.'
                        : '⚠️ OpenAI API usage limit exceeded. Please check billing or wait until next month.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Possible Causes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>{labels.possibleCauses}</span>
            </h3>
            <ul className="space-y-2">
              {getPossibleCauses(errorData.message || '').map((cause, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Suggestions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span>{labels.suggestions}</span>
            </h3>
            <ul className="space-y-2">
              {getSuggestions(errorData.message || '').map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={copyErrorToClipboard}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {labels.copyError}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {labels.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}