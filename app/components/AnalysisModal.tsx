'use client'

import React from 'react'

interface AnalysisModalProps {
  show: boolean
  onClose: () => void
  onConfirm: () => void
  isAnalyzing: boolean
  analysisCompleted: boolean
  analysisLogs: string[]
  analysisProgress: number
  selectedDate: string
  companyName: string
  itemCount: number
  showDetailedLog: boolean
}

export default function AnalysisModal({
  show,
  onClose,
  onConfirm,
  isAnalyzing,
  analysisCompleted,
  analysisLogs,
  analysisProgress,
  selectedDate,
  companyName,
  itemCount,
  showDetailedLog
}: AnalysisModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl" style={{ 
        maxWidth: '600px', 
        width: '100%',
        height: '80vh',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">AI 분석 실행 확인</h2>
          <button 
            onClick={onClose}
            disabled={isAnalyzing}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isAnalyzing ? '분석 중에는 닫을 수 없습니다' : '닫기'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6" style={{
          flex: 1,
          minHeight: 0
        }}>
          {!isAnalyzing && !analysisCompleted ? (
            <>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '1rem', fontWeight: '600' }}>
                      AI 분석을 실행하시겠습니까?
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#78350f', fontSize: '0.875rem' }}>
                      선택한 날짜: <strong>{selectedDate ? selectedDate.split('T')[0] : '날짜 미선택'}</strong>
                    </p>
                    <p style={{ margin: 0, color: '#78350f', fontSize: '0.875rem' }}>
                      {itemCount}개의 분석 항목에 대해 AI 분석이 실행됩니다.
                      기존 분석 데이터가 있다면 덮어쓰여집니다.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Progress Bar */}
              {isAnalyzing && (
                <div style={{ 
                  padding: '1.5rem',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: '#f59e0b',
                      borderRadius: '50%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                    <span style={{ fontWeight: '600', color: '#92400e' }}>
                      AI 분석 진행 중...
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{analysisProgress.toFixed(2)}% 완료</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Analysis Logs */}
              {showDetailedLog && analysisLogs.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>분석 로그:</h4>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#374151' }}>
                    {analysisLogs.map((log, index) => (
                      <div key={index} style={{ marginBottom: '0.25rem' }}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Completion Message */}
              {analysisCompleted && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #34d399',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontWeight: '600' }}>분석이 성공적으로 완료되었습니다!</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        {!isAnalyzing && !analysisCompleted && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              분석 시작
            </button>
          </div>
        )}
        
        {analysisCompleted && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  )
}