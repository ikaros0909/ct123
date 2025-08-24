'use client'

import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Loader } from 'lucide-react'

interface ExcelUploadProps {
  companyId: string
  companyName: string
  onUploadSuccess: () => void
  onClose: () => void
}

interface ExcelRow {
  sequenceNumber: number
  item: string
  itemEn?: string
  question: string
  questionEn?: string
  category: string
  categoryEn?: string
  weight: number
  generalRule?: string
  generalRuleEn?: string
}

export default function ExcelUpload({ 
  isOpen, 
  companyId, 
  companyName, 
  onSuccess, 
  onClose 
}: {
  isOpen: boolean
  companyId: string
  companyName: string
  onSuccess: () => void
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ExcelRow[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 엑셀 템플릿 다운로드
  const downloadTemplate = () => {
    const templateData = [
      // I. 기업내생변수 (3개)
      {
        '연번': 1,
        '항목': '매출 성장률 전망',
        '항목(영문)': 'Revenue Growth Outlook',
        '질문': '향후 3개월 내 매출 성장률 전망은?',
        '질문(영문)': 'What is the revenue growth outlook for the next 3 months?',
        '카테고리': 'I. 기업내생변수',
        '카테고리(영문)': 'I. Internal Factors',
        '가중치': 0.15,
        '일반법칙': '매출 성장률이 높을수록 긍정적',
        '일반법칙(영문)': 'Higher revenue growth is positive'
      },
      {
        '연번': 2,
        '항목': '수익성 개선 전망',
        '항목(영문)': 'Profitability Improvement',
        '질문': '영업이익률 개선 가능성은?',
        '질문(영문)': 'What is the possibility of operating margin improvement?',
        '카테고리': 'I. 기업내생변수',
        '카테고리(영문)': 'I. Internal Factors',
        '가중치': 0.12,
        '일반법칙': '수익성 개선 가능성이 높을수록 긍정적',
        '일반법칙(영문)': 'Higher profitability improvement potential is positive',
      },
      {
        '연번': 3,
        '항목': '신사업 성장성',
        '항목(영문)': 'New Business Growth',
        '질문': '신사업 부문의 성장 가능성은?',
        '질문(영문)': 'What is the growth potential of new business segments?',
        '카테고리': 'I. 기업내생변수',
        '카테고리(영문)': 'I. Internal Factors',
        '가중치': 0.10,
        '일반법칙': '신사업 성장 가능성이 높을수록 긍정적',
        '일반법칙(영문)': 'Higher new business growth potential is positive',
      },
      // II. 시장변수 (4개)
      {
        '연번': 4,
        '항목': '시장 점유율 변화',
        '항목(영문)': 'Market Share Change',
        '질문': '주요 시장에서의 점유율 변화는?',
        '질문(영문)': 'How is the market share changing in key markets?',
        '카테고리': 'II. 시장변수',
        '카테고리(영문)': 'II. Market Factors',
        '가중치': 0.12,
        '일반법칙': '시장 점유율 증가는 긍정적',
        '일반법칙(영문)': 'Market share increase is positive',
      },
      {
        '연번': 5,
        '항목': '경쟁 강도',
        '항목(영문)': 'Competition Intensity',
        '질문': '산업 내 경쟁 강도 변화는?',
        '질문(영문)': 'How is competition intensity changing?',
        '카테고리': 'II. 시장변수',
        '카테고리(영문)': 'II. Market Factors',
        '가중치': 0.10,
        '일반법칙': '경쟁 강도가 낮을수록 긍정적',
        '일반법칙(영문)': 'Lower competition intensity is positive',
      },
      {
        '연번': 6,
        '항목': '고객 수요 전망',
        '항목(영문)': 'Customer Demand Outlook',
        '질문': '고객 수요 증가 전망은?',
        '질문(영문)': 'What is the customer demand growth outlook?',
        '카테고리': 'II. 시장변수',
        '카테고리(영문)': 'II. Market Factors',
        '가중치': 0.11,
        '일반법칙': '고객 수요 증가가 긍정적',
        '일반법칙(영문)': 'Customer demand increase is positive',
      },
      {
        '연번': 7,
        '항목': '가격 경쟁력',
        '항목(영문)': 'Price Competitiveness',
        '질문': '제품/서비스의 가격 경쟁력은?',
        '질문(영문)': 'How competitive are product/service prices?',
        '카테고리': 'II. 시장변수',
        '카테고리(영문)': 'II. Market Factors',
        '가중치': 0.09,
        '일반법칙': '가격 경쟁력이 높을수록 긍정적',
        '일반법칙(영문)': 'Higher price competitiveness is positive',
      },
      // III. 거시환경변수 (3개)
      {
        '연번': 8,
        '항목': 'GDP 성장률',
        '항목(영문)': 'GDP Growth Rate',
        '질문': '국가 GDP 성장률 전망은?',
        '질문(영문)': 'What is the GDP growth rate outlook?',
        '카테고리': 'III. 거시환경변수',
        '카테고리(영문)': 'III. Macro Environment',
        '가중치': 0.08,
        '일반법칙': 'GDP 성장률이 높을수록 긍정적',
        '일반법칙(영문)': 'Higher GDP growth is positive',
      },
      {
        '연번': 9,
        '항목': '금리 동향',
        '항목(영문)': 'Interest Rate Trend',
        '질문': '금리 변화가 사업에 미치는 영향은?',
        '질문(영문)': 'What is the impact of interest rate changes?',
        '카테고리': 'III. 거시환경변수',
        '카테고리(영문)': 'III. Macro Environment',
        '가중치': 0.07,
        '일반법칙': '금리 하락이 긍정적',
        '일반법칙(영문)': 'Interest rate decline is positive',
      },
      {
        '연번': 10,
        '항목': '환율 변동',
        '항목(영문)': 'Exchange Rate',
        '질문': '환율 변동이 미치는 영향은?',
        '질문(영문)': 'What is the impact of exchange rate changes?',
        '카테고리': 'III. 거시환경변수',
        '카테고리(영문)': 'III. Macro Environment',
        '가중치': 0.06,
        '일반법칙': '수출기업은 원화약세 긍정',
        '일반법칙(영문)': 'Exporters benefit from currency depreciation',
      },
      // IV. 정책/규제변수 (3개)
      {
        '연번': 11,
        '항목': '정부 지원 정책',
        '항목(영문)': 'Government Support',
        '질문': '정부의 산업 지원 정책 수준은?',
        '질문(영문)': 'What is the level of government support?',
        '카테고리': 'IV. 정책/규제변수',
        '카테고리(영문)': 'IV. Policy/Regulatory',
        '가중치': 0.08,
        '일반법칙': '정부 지원이 많을수록 긍정적',
        '일반법칙(영문)': 'More government support is positive',
      },
      {
        '연번': 12,
        '항목': '규제 환경',
        '항목(영문)': 'Regulatory Environment',
        '질문': '규제 환경 변화 방향은?',
        '질문(영문)': 'How is the regulatory environment changing?',
        '카테고리': 'IV. 정책/규제변수',
        '카테고리(영문)': 'IV. Policy/Regulatory',
        '가중치': 0.07,
        '일반법칙': '규제 완화가 긍정적',
        '일반법칙(영문)': 'Deregulation is positive',
      },
      {
        '연번': 13,
        '항목': '세제 혜택',
        '항목(영문)': 'Tax Benefits',
        '질문': '세제 혜택 수준과 지속 가능성은?',
        '질문(영문)': 'What is the level and sustainability of tax benefits?',
        '카테고리': 'IV. 정책/규제변수',
        '카테고리(영문)': 'IV. Policy/Regulatory',
        '가중치': 0.05,
        '일반법칙': '세제 혜택이 많을수록 긍정적',
        '일반법칙(영문)': 'More tax benefits are positive',
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '분석항목')
    
    // 컬럼 너비 설정
    ws['!cols'] = [
      { wch: 8 },   // 연번
      { wch: 25 },  // 항목
      { wch: 25 },  // 항목(영문)
      { wch: 40 },  // 질문
      { wch: 40 },  // 질문(영문)
      { wch: 20 },  // 카테고리
      { wch: 20 },  // 카테고리(영문)
      { wch: 10 },  // 가중치
      { wch: 30 },  // 일반법칙
      { wch: 30 }   // 일반법칙(영문)
    ]

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `${companyName}_분석항목_템플릿.xlsx`)
  }

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.')
      return
    }

    setFile(selectedFile)
    setError(null)
    readExcelFile(selectedFile)
  }

  // 엑셀 파일 읽기
  const readExcelFile = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // 데이터 검증 및 변환
        const validatedData: ExcelRow[] = jsonData.map((row: any, index) => {
          if (!row['연번'] || !row['항목'] || !row['질문'] || !row['카테고리'] || row['가중치'] === undefined) {
            throw new Error(`행 ${index + 2}: 필수 필드가 누락되었습니다.`)
          }
          
          return {
            sequenceNumber: Number(row['연번']),
            item: String(row['항목']),
            itemEn: row['항목(영문)'] ? String(row['항목(영문)']) : undefined,
            question: String(row['질문']),
            questionEn: row['질문(영문)'] ? String(row['질문(영문)']) : undefined,
            category: String(row['카테고리']),
            categoryEn: row['카테고리(영문)'] ? String(row['카테고리(영문)']) : undefined,
            weight: Number(row['가중치']),
            generalRule: row['일반법칙'] ? String(row['일반법칙']) : undefined,
            generalRuleEn: row['일반법칙(영문)'] ? String(row['일반법칙(영문)']) : undefined
          }
        })
        
        setPreview(validatedData.slice(0, 5)) // 미리보기는 5개까지만
        setError(null)
      } catch (err: any) {
        setError(err.message || '파일을 읽는 중 오류가 발생했습니다.')
        setPreview([])
      }
    }
    
    reader.readAsBinaryString(file)
  }

  // 업로드 처리
  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)

    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // 데이터 변환
        const items = jsonData.map((row: any) => ({
          sequenceNumber: Number(row['연번']),
          item: String(row['항목']),
          itemEn: row['항목(영문)'] || null,
          question: String(row['질문']),
          questionEn: row['질문(영문)'] || null,
          category: String(row['카테고리']),
          categoryEn: row['카테고리(영문)'] || null,
          weight: Number(row['가중치']),
          generalRule: row['일반법칙'] || '',
          generalRuleEn: row['일반법칙(영문)'] || null,
          scale: 0,  // 척도는 분석 결과이므로 기본값 0
          modifiedScale: 0,  // 수정된 척도도 분석 결과이므로 기본값 0
          cumulativeScore: 0,
          index: 0
        }))

        // API 호출
        const response = await fetch('/api/admin/excel-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            companyId,
            items
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.duplicates) {
            throw new Error(`중복된 연번이 있어 업로드할 수 없습니다.\n연번: ${errorData.duplicates.join(', ')}\n\n기존 데이터를 확인하거나 다른 연번을 사용해주세요.`)
          }
          throw new Error(errorData.error || '업로드 실패')
        }

        const result = await response.json()
        
        setUploadProgress(100)
        setUploadStatus('success')
        
        setTimeout(() => {
          onSuccess()
        }, 1500)
        
      } catch (err: any) {
        setError(err.message || '업로드 중 오류가 발생했습니다.')
        setUploadStatus('error')
      } finally {
        setUploading(false)
      }
    }
    
    reader.readAsBinaryString(file)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">엑셀 업로드</h2>
                <p className="text-sm text-white/80">{companyName} 분석항목 일괄 등록</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Download Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">1. 엑셀 템플릿 다운로드</h3>
                <p className="text-sm text-blue-700 mt-1">
                  먼저 템플릿을 다운로드하여 양식에 맞게 작성해주세요.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  템플릿 다운로드
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">2. 작성한 엑셀 파일 업로드</h3>
                <p className="text-sm text-gray-600 mb-4">
                  템플릿에 맞게 작성한 엑셀 파일을 선택하세요
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  파일 선택
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null)
                      setPreview([])
                      setError(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                {preview.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">미리보기 (처음 5개 항목)</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">연번</th>
                            <th className="px-3 py-2 text-left">항목</th>
                            <th className="px-3 py-2 text-left">카테고리</th>
                            <th className="px-3 py-2 text-left">가중치</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {preview.map((row, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2">{row.sequenceNumber}</td>
                              <td className="px-3 py-2">{row.item}</td>
                              <td className="px-3 py-2">{row.category}</td>
                              <td className="px-3 py-2">{row.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">오류</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadStatus !== 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {uploadStatus === 'uploading' && '업로드 중...'}
                  {uploadStatus === 'success' && '업로드 완료!'}
                  {uploadStatus === 'error' && '업로드 실패'}
                </span>
                <span className="text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    uploadStatus === 'success' ? 'bg-green-500' :
                    uploadStatus === 'error' ? 'bg-red-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadStatus === 'success' && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">분석항목이 성공적으로 등록되었습니다!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - fixed at bottom */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <div>* 기존 데이터는 유지되며 새 항목이 추가됩니다.</div>
              <div>* 중복된 연번이 있으면 업로드가 중단됩니다.</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading || uploadStatus === 'success'}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  !file || uploading || uploadStatus === 'success'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>업로드 중...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>업로드</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}