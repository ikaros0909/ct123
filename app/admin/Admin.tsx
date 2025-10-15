'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ExcelUpload from '../components/ExcelUpload'
import { FileSpreadsheet } from 'lucide-react'
import styles from './Admin.module.css'

// CT123 로고 컴포넌트
const Logo = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.5px'
  }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
      <text x="16" y="22" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">CT</text>
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#e3f2fd"/>
          <stop offset="100%" stopColor="#f3e5f5"/>
        </linearGradient>
      </defs>
    </svg>
    CT123
  </div>
)

// 아이콘 컴포넌트
const Icons = {
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"/>
    </svg>
  ),
  Delete: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
    </svg>
  ),
  Company: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  TrendDown: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zM3 12a1 1 0 011 1v1h1a1 1 0 110 2H4v1a1 1 0 11-2 0v-1H1a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14 7l4.256 1.033a1 1 0 010 1.934L14 11l-1.033 4.256a1 1 0 01-1.934 0L10 11l-4.256-1.033a1 1 0 010-1.934L10 7l1.033-4.256A1 1 0 0112 2z"/>
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
    </svg>
  ),
  KeyOff: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L11.586 8l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
      <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414l10-10a1 1 0 011.414 0 1 1 0 010 1.414l-10 10a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      <path d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" opacity="0.3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
    </svg>
  ),
  Add: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
    </svg>
  ),
  Document: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
    </svg>
  )
}

interface Company {
  id: string
  name: string
  nameKr?: string
  description?: string
  systemPrompt?: string
  _count?: {
    analyses: number
    mainData: number
  }
  order?: number
}

interface MainData {
  id: string
  companyId: string
  sequenceNumber: number
  item: string
  question: string
  scale: number
  generalRule: string
  modifiedScale: number
  cumulativeScore: number
  weight: number
  index: number
  source?: string
  category: string
  company?: {
    id: string
    name: string
    nameKr?: string
  }
}

interface Analysis {
  id: string
  companyId: string
  date: string
  sequenceNumber: number
  item: string
  scale: number
  modifiedScale: number
  cumulativeScore: number
  weight: number
  index: number
  category: string
}

interface Report {
  id: string
  companyId: string
  date: string
  type: 'NOW' | 'INSIGHT'
  content: string
  contentEn?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showExcelUpload, setShowExcelUpload] = useState(false)
  const [excelUploadCompany, setExcelUploadCompany] = useState<Company | null>(null)
  const [mainData, setMainData] = useState<MainData[]>([])
  const [analysisData, setAnalysisData] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'company' | 'mainData' | 'analysis'>('company')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'items' | 'results'>('items')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [analysisDate, setAnalysisDate] = useState<string>('')
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReportType, setSelectedReportType] = useState<'NOW' | 'INSIGHT' | 'ALL'>('ALL')
  const [draggedCompany, setDraggedCompany] = useState<Company | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showDeleteReportModal, setShowDeleteReportModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<any>(null)
  const [showSystemPromptEdit, setShowSystemPromptEdit] = useState(false)
  const [systemPromptForm, setSystemPromptForm] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showAnalysisConfirmModal, setShowAnalysisConfirmModal] = useState(false)
  const [showDateAlertModal, setShowDateAlertModal] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [showGPTModal, setShowGPTModal] = useState(false)
  const [gptApiKey, setGptApiKey] = useState('')
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string>('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState<Record<string, {status: string, item?: string}>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetailedLog, setShowDetailedLog] = useState(false)
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])
  const [analysisCompleted, setAnalysisCompleted] = useState(false)

  // 폼 데이터
  const [companyForm, setCompanyForm] = useState({
    name: '',
    nameKr: '',
    description: ''
  })

  const [mainDataForm, setMainDataForm] = useState({
    companyId: '',
    sequenceNumber: 0,
    item: '',
    question: '',
    scale: 0,
    generalRule: '',
    modifiedScale: 0,
    cumulativeScore: 0,
    weight: 0,
    index: 0,
    source: '',
    category: ''
  })

  const [analysisForm, setAnalysisForm] = useState({
    companyId: '',
    date: new Date().toISOString().split('T')[0],
    sequenceNumber: 0,
    item: '',
    scale: 0,
    modifiedScale: 0,
    cumulativeScore: 0,
    weight: 0,
    index: 0,
    category: ''
  })

  // 인증 체크
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // 날짜 초기화 (자동 선택 방지)
    setAnalysisDate('')
    setSelectedDate('')

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    })
    .then(data => {
      if (data.role !== 'ADMIN') {
        throw new Error('Admin access required')
      }
      setIsAuthenticated(true)
      loadData()
      loadGPTSettings()
    })
    .catch(() => {
      router.push('/login')
    })
  }, [router])

  // 선택된 회사 또는 날짜가 변경될 때 리포트 로드
  useEffect(() => {
    if (selectedCompany && selectedDate) {
      loadReports(selectedCompany.id, selectedDate)
    }
  }, [selectedCompany, selectedDate])


  // GPT 설정 로드
  const loadGPTSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/gpt-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setGptApiKey(data.apiKey || '')
      }
    } catch (err) {
      console.error('GPT 설정 로드 실패:', err)
    }
  }

  // GPT 설정 저장
  const saveGPTSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/gpt-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey: gptApiKey })
      })
      
      if (response.ok) {
        setSuccessMessage('GPT API 키가 저장되었습니다.')
        setShowGPTModal(false)
      } else {
        const errorData = await response.json()
        console.error('GPT 설정 저장 실패:', errorData)
        setError(errorData.error || '저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('GPT 설정 저장 실패:', err)
      setError('저장 중 오류가 발생했습니다.')
    }
  }

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 기업 데이터 로드
      const companiesRes = await fetch('/api/admin/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        
        // order 필드로 정렬 (order가 같으면 createdAt 기준)
        const sortedCompanies = companiesData.sort((a: any, b: any) => {
          // order 필드가 있으면 order로 정렬
          if (typeof a.order === 'number' && typeof b.order === 'number') {
            if (a.order !== b.order) {
              return a.order - b.order
            }
          }
          // order가 같거나 없으면 createdAt으로 정렬
          if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
          // createdAt도 없으면 id로 정렬
          return String(a.id).localeCompare(String(b.id))
        })
        
        setCompanies(sortedCompanies)
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 사용자 목록 로드
  // 특정 기업 데이터 로드
  const loadCompanyData = async (companyId: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 기업 상세 정보 로드 (시스템 프롬프트 포함)
      const companyRes = await fetch(`/api/admin/companies/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (companyRes.ok) {
        const companyData = await companyRes.json()
        setSelectedCompany(companyData)
      }
      
      // Main Data 로드
      const mainDataRes = await fetch(`/api/admin/main-data?companyId=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (mainDataRes.ok) {
        const mainDataList = await mainDataRes.json()
        setMainData(mainDataList)
      }

      // Analysis Data 로드
      const analysisRes = await fetch(`/api/analysis-data?companyId=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (analysisRes.ok) {
        const analysisList = await analysisRes.json()
        setAnalysisData(analysisList)
      }

      // Reports 로드
      const reportsRes = await fetch(`/api/reports?companyId=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (reportsRes.ok) {
        const reportsList = await reportsRes.json()
        setReports(reportsList)
      }
    } catch (err) {
      console.error('Error loading company data:', err)
      setError('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 리포트 데이터 로드
  const loadReports = async (companyId: string, date?: string) => {
    try {
      const token = localStorage.getItem('token')
      let url = `/api/reports?companyId=${companyId}`
      if (date) {
        url += `&date=${date}`
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const reportList = await response.json()
        setReports(reportList)
      }
    } catch (err) {
      console.error('Error loading reports:', err)
      setError('리포트를 불러오는데 실패했습니다')
    }
  }

  // 리포트 수정
  const updateReport = async (reportId: string, updatedData: Partial<Report>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      })
      
      if (response.ok) {
        setSuccessMessage('리포트가 업데이트되었습니다')
        setTimeout(() => setSuccessMessage(null), 3000)
        // 리포트 목록 새로고침
        if (selectedCompany) {
          loadReports(selectedCompany.id, selectedDate)
        }
      } else {
        setError('리포트 업데이트에 실패했습니다')
      }
    } catch (err) {
      console.error('Error updating report:', err)
      setError('리포트 업데이트 중 오류가 발생했습니다')
    }
  }

  // 리포트 삭제
  const deleteReport = async (reportId: string) => {
    if (!confirm('정말로 이 리포트를 삭제하시겠습니까?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        setSuccessMessage('리포트가 삭제되었습니다')
        setTimeout(() => setSuccessMessage(null), 3000)
        // 리포트 목록 새로고침
        if (selectedCompany) {
          loadReports(selectedCompany.id, selectedDate)
        }
      } else {
        setError('리포트 삭제에 실패했습니다')
      }
    } catch (err) {
      console.error('Error deleting report:', err)
      setError('리포트 삭제 중 오류가 발생했습니다')
    }
  }

  // 리포트 삭제 (확인 없이)
  const deleteReportWithoutConfirm = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        setSuccessMessage('리포트가 삭제되었습니다')
        setTimeout(() => setSuccessMessage(null), 3000)
        // 리포트 목록 새로고침
        if (selectedCompany) {
          loadReports(selectedCompany.id, selectedDate)
        }
      } else {
        setError('리포트 삭제에 실패했습니다')
      }
    } catch (err) {
      console.error('Error deleting report:', err)
      setError('리포트 삭제 중 오류가 발생했습니다')
    }
  }

  // 기업 순서 저장
  const saveCompanyOrder = async (orderedCompanies: Company[]) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/companies/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companies: orderedCompanies })
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('기업 순서 저장 실패:', error)
        setError('순서 저장에 실패했습니다')
      } else {
        // 성공 메시지 표시
        setError(null)
        setSuccessMessage('기업 순서가 저장되었습니다')
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
        
        // DB에서 업데이트된 기업 목록 다시 로드
        const companiesRes = await fetch('/api/admin/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          
          // order 필드로 정렬 (order가 같으면 createdAt 기준)
          const sortedCompanies = companiesData.sort((a: any, b: any) => {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              if (a.order !== b.order) {
                return a.order - b.order
              }
            }
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            }
            return String(a.id).localeCompare(String(b.id))
          })
          
          setCompanies(sortedCompanies)
        }
      }
    } catch (err) {
      console.error('기업 순서 저장 오류:', err)
      setError('순서 저장 중 오류가 발생했습니다')
    }
  }

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // 모달 열기
  const openModal = (type: 'company' | 'mainData' | 'analysis', item?: any) => {
    setModalType(type)
    setEditingItem(item)
    
    if (type === 'company') {
      if (item) {
        setCompanyForm({
          name: item.name,
          nameKr: item.nameKr || '',
          description: item.description || ''
        })
      } else {
        setCompanyForm({ name: '', nameKr: '', description: '' })
      }
    } else if (type === 'mainData') {
      if (item) {
        setMainDataForm({
          companyId: item.companyId,
          sequenceNumber: item.sequenceNumber,
          item: item.item,
          question: item.question,
          scale: item.scale,
          generalRule: item.generalRule,
          modifiedScale: item.modifiedScale,
          cumulativeScore: item.cumulativeScore,
          weight: item.weight,
          index: item.index,
          source: item.source || '',
          category: item.category
        })
      } else {
        setMainDataForm({
          companyId: selectedCompany?.id || '',
          sequenceNumber: 0,
          item: '',
          question: '',
          scale: 0,
          generalRule: '',
          modifiedScale: 0,
          cumulativeScore: 0,
          weight: 0,
          index: 0,
          source: '',
          category: selectedCategory || ''
        })
      }
    } else if (type === 'analysis') {
      if (item) {
        setAnalysisForm({
          companyId: item.companyId,
          date: item.date.split('T')[0],
          sequenceNumber: item.sequenceNumber,
          item: item.item,
          scale: item.scale,
          modifiedScale: item.modifiedScale,
          cumulativeScore: item.cumulativeScore,
          weight: item.weight,
          index: item.index,
          category: item.category
        })
      } else {
        // 선택된 MainData 항목을 기반으로 Analysis 폼 초기화
        const selectedMainData = mainData.find(d => d.sequenceNumber === item?.sequenceNumber) || mainData[0]
        if (selectedMainData) {
          setAnalysisForm({
            companyId: selectedCompany?.id || '',
            date: analysisDate,
            sequenceNumber: selectedMainData.sequenceNumber,
            item: selectedMainData.item,
            scale: 0,
            modifiedScale: 0,
            cumulativeScore: 0,
            weight: selectedMainData.weight,
            index: 0,
            category: selectedMainData.category
          })
        }
      }
    }
    setShowModal(true)
  }

  // 기업 저장
  const handleCompanySave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingItem
        ? `/api/admin/companies/${editingItem.id}`
        : '/api/admin/companies'

      console.log('Saving company:', companyForm, 'to:', url)

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...companyForm,
          systemPrompt: editingItem?.systemPrompt // 기존 시스템 프롬프트 유지
        })
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Company save failed:', data)
        throw new Error(data.error)
      }

      const savedCompany = await res.json()
      console.log('Company saved successfully:', savedCompany)

      setShowModal(false)
      setSuccessMessage('기업이 성공적으로 저장되었습니다.')
      loadData()
    } catch (err: any) {
      console.error('Error saving company:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 분석항목 저장
  const handleMainDataSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingItem 
        ? `/api/admin/main-data/${editingItem.id}`
        : '/api/admin/main-data'
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mainDataForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setShowModal(false)
      if (selectedCompany) {
        loadCompanyData(selectedCompany.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 분석결과 저장
  const handleAnalysisSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = editingItem 
        ? `/api/analysis-data/${editingItem.id}`
        : '/api/analysis-data'
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(analysisForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setShowModal(false)
      if (selectedCompany) {
        loadCompanyData(selectedCompany.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 삭제
  const handleDelete = async (type: 'company' | 'mainData' | 'analysis', id: string) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url = type === 'company' 
        ? `/api/admin/companies/${id}`
        : type === 'mainData'
        ? `/api/admin/main-data/${id}`
        : `/api/analysis-data/${id}`
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      if (type === 'company') {
        setSelectedCompany(null)
        loadData()
      } else if (selectedCompany) {
        loadCompanyData(selectedCompany.id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 목록 가져오기
  const categories = Array.from(new Set(mainData.map(item => item.category))).sort()

  // 필터링된 데이터
  const filteredMainData = mainData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 날짜별 분석 데이터 그룹화
  const analysisByDate = analysisData.reduce((acc, item) => {
    const date = item.date.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, Analysis[]>)

  // 카테고리별 합계 계산
  const calculateCategoryTotals = (data: Analysis[]) => {
    const totals: Record<string, { index: number, count: number }> = {}
    data.forEach(item => {
      if (!totals[item.category]) {
        totals[item.category] = { index: 0, count: 0 }
      }
      totals[item.category].index += item.index
      totals[item.category].count++
    })
    return totals
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />
          
          {/* 글로벌 네비게이션 */}
          <nav style={{
            display: 'flex',
            gap: '0',
            marginLeft: '48px',
            borderBottom: '2px solid transparent',
            position: 'relative'
          }}>
            <a 
              href="/admin" 
              onClick={(e) => {
                e.preventDefault()
                router.push('/admin')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 20px',
                height: '40px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '-0.2px',
                transition: 'all 0.2s ease',
                position: 'relative',
                color: pathname === '/admin' ? '#000000' : '#86868b',
                cursor: 'pointer',
                borderBottom: pathname === '/admin' ? '2px solid #000000' : '2px solid transparent',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin') {
                  e.currentTarget.style.color = '#000000'
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin') {
                  e.currentTarget.style.color = '#86868b'
                }
              }}
            >
              <Icons.Company />
              <span>기업 관리</span>
            </a>
            <a 
              href="/admin/users" 
              onClick={(e) => {
                e.preventDefault()
                router.push('/admin/users')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 20px',
                height: '40px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '-0.2px',
                transition: 'all 0.2s ease',
                position: 'relative',
                color: pathname === '/admin/users' ? '#000000' : '#86868b',
                cursor: 'pointer',
                borderBottom: pathname === '/admin/users' ? '2px solid #000000' : '2px solid transparent',
                marginBottom: '-2px'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/users') {
                  e.currentTarget.style.color = '#000000'
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/users') {
                  e.currentTarget.style.color = '#86868b'
                }
              }}
            >
              <Icons.Users />
              <span>사용자 관리</span>
            </a>
          </nav>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={() => setShowGPTModal(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              marginRight: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ 
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {gptApiKey ? (
                <>
                  <Icons.Key />
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                </>
              ) : (
                <>
                  <Icons.KeyOff />
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid white',
                    animation: 'pulse 2s infinite'
                  }} />
                </>
              )}
            </div>
            <span style={{
              color: gptApiKey ? '#1d1d1f' : '#ef4444',
              fontWeight: gptApiKey ? '500' : '600',
              fontSize: '14px'
            }}>
              GPT {gptApiKey ? '설정됨' : '미설정'}
            </span>
          </button>
          <div className={styles.userMenuWrapper}>
            <button 
              className={styles.userMenuBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={styles.avatar}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span>{user?.name || user?.email}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{user?.name || '이름 없음'}</div>
                    <div className={styles.dropdownEmail}>{user?.email}</div>
                  </div>
                </div>
                <div className={styles.dropdownDivider} />
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    setUserEditForm({
                      name: user?.name || '',
                      email: user?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                    setShowUserEditModal(true)
                    setShowUserMenu(false)
                  }}
                >
                  <Icons.User />
                  <span>계정 설정</span>
                </button>
                <div className={styles.dropdownDivider} />
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    handleLogout()
                    setShowUserMenu(false)
                  }}
                >
                  <Icons.Logout />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {!selectedCompany ? (
          // 기업 카드 목록
          <div className={styles.companyGrid}>
            {/* 새 기업 추가 카드 - 애플 스타일 */}
            <div className={styles.addCard} onClick={() => openModal('company')}>
              <div className={styles.addCardIcon}>
                <Icons.Plus />
              </div>
              <span className={styles.addCardText}>새 기업 추가</span>
              <span className={styles.addCardHint}>클릭하여 기업 추가</span>
            </div>

            {/* 기업 카드들 - 애플 스타일 */}
            {companies.map((company, index) => (
              <div 
                key={company.id} 
                className={`${styles.companyCard} ${dragOverIndex === index ? styles.dragOver : ''}`}
                draggable
                onDragStart={(e) => {
                  setDraggedCompany(company);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => {
                  setDraggedCompany(null);
                  setDragOverIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  setDragOverIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedCompany && draggedCompany.id !== company.id) {
                    const newCompanies = [...companies];
                    const draggedIndex = companies.findIndex(c => c.id === draggedCompany.id);
                    
                    // Remove dragged company
                    newCompanies.splice(draggedIndex, 1);
                    
                    // Insert at new position
                    const dropIndex = draggedIndex < index ? index - 1 : index;
                    newCompanies.splice(dropIndex, 0, draggedCompany);
                    
                    // Update order and save to database
                    const orderedCompanies = newCompanies.map((c, i) => ({
                      ...c,
                      order: i
                    }));
                    
                    setCompanies(orderedCompanies);
                    saveCompanyOrder(orderedCompanies);
                  }
                  setDraggedCompany(null);
                  setDragOverIndex(null);
                }}
                onClick={() => {
                  setSelectedCompany(company);
                  loadCompanyData(company.id);
                }}
              >
                <div className={styles.cardIcon}>
                  <div className={styles.iconWrapper}>
                    {(company.nameKr || company.name).charAt(0)}
                  </div>
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardMain}>
                    <h3>{company.nameKr || company.name}</h3>
                    <p className={styles.companyNameEn}>{company.name}</p>
                    {company.description && (
                      <p className={styles.cardDescription}>{company.description}</p>
                    )}
                  </div>
                  
                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>분석항목</span>
                      <span className={styles.metaValue}>{company._count?.mainData || 0}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>프롬프트</span>
                      <span className={`${styles.metaValue} ${company.systemPrompt ? styles.statusActive : styles.statusInactive}`}>
                        {company.systemPrompt ? '• 설정됨' : '• 미설정'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExcelUploadCompany(company);
                      setShowExcelUpload(true);
                    }}
                    title="엑셀 업로드"
                    style={{ color: '#10b981' }}
                  >
                    <FileSpreadsheet size={18} />
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('company', company);
                    }}
                    title="편집"
                  >
                    <Icons.Edit />
                  </button>
                  <button 
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete('company', company.id);
                    }}
                    disabled={(company._count?.mainData || 0) > 0}
                    title="삭제"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 선택된 기업의 데이터 관리
          <div className={styles.companyDetail}>
            {/* 서브 헤더 */}
            <div className={styles.subHeader}>
              <div className={styles.subHeaderLeft}>
                <button className={styles.backBtn} onClick={() => {
                  setSelectedCompany(null);
                  setMainData([]);
                  setAnalysisData([]);
                  setSelectedCategory('');
                  setSearchTerm('');
                  setActiveTab('items');
                }}>
                  <Icons.Back />
                </button>
                <h1 className={styles.companyTitle}>{selectedCompany.nameKr || selectedCompany.name}</h1>
              </div>
              
              {/* 탭 네비게이션 */}
              <div className={styles.tabNav}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'items' ? styles.active : ''}`}
                  onClick={() => setActiveTab('items')}
                >
                  <Icons.Chart />
                  <span>분석항목 관리</span>
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'results' ? styles.active : ''}`}
                  onClick={() => {
                    setActiveTab('results')
                    // 날짜 자동 선택 제거 - 사용자가 직접 선택하도록 함
                  }}
                >
                  <Icons.TrendUp />
                  <span>분석결과 관리</span>
                </button>
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === 'items' ? (
              // 분석항목 탭
              <>
                {/* 시스템 프롬프트 섹션 */}
                <div className={styles.systemPromptSection}>
                  <div className={styles.sectionHeader}>
                    <h3>
                      <Icons.Edit />
                      <span>시스템 프롬프트</span>
                    </h3>
                    <button 
                      className={styles.editPromptBtn}
                      onClick={() => {
                        setSystemPromptForm(selectedCompany?.systemPrompt || '')
                        setShowSystemPromptEdit(true)
                      }}
                    >
                      {selectedCompany?.systemPrompt ? '수정' : '설정'}
                    </button>
                  </div>
                  
                  {showSystemPromptEdit ? (
                    <div className={styles.promptEditBox}>
                      <textarea
                        value={systemPromptForm}
                        onChange={(e) => setSystemPromptForm(e.target.value)}
                        placeholder="모든 분석 항목에 공통으로 적용될 프롬프트를 입력하세요...\n예: 이 기업은 반도체 제조 분야의 선두기업으로..."
                        rows={6}
                      />
                      <div className={styles.promptActions}>
                        <button 
                          className={styles.cancelBtn}
                          onClick={() => setShowSystemPromptEdit(false)}
                        >
                          취소
                        </button>
                        <button 
                          className={styles.saveBtn}
                          onClick={async () => {
                            setLoading(true)
                            try {
                              const token = localStorage.getItem('token')
                              const res = await fetch(`/api/admin/companies/${selectedCompany?.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  name: selectedCompany?.name,
                                  nameKr: selectedCompany?.nameKr,
                                  description: selectedCompany?.description,
                                  systemPrompt: systemPromptForm
                                })
                              })
                              
                              if (res.ok) {
                                const updatedCompany = await res.json()
                                setSelectedCompany(updatedCompany)
                                setShowSystemPromptEdit(false)
                                // 기업 목록도 업데이트
                                setCompanies(prev => prev.map(c => 
                                  c.id === updatedCompany.id ? updatedCompany : c
                                ))
                              }
                            } catch (err) {
                              console.error('시스템 프롬프트 저장 오류:', err)
                              setError('시스템 프롬프트 저장에 실패했습니다')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          disabled={loading}
                        >
                          {loading ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.promptDisplay}>
                      {selectedCompany?.systemPrompt ? (
                        <p>{selectedCompany.systemPrompt}</p>
                      ) : (
                        <p className={styles.noPrompt}>시스템 프롬프트가 설정되지 않았습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.divider} />
                <div className={styles.toolbar}>
                  <div className={styles.toolbarLeft}>
                    <button className={styles.addBtn} onClick={() => openModal('mainData')}>
                      <Icons.Plus />
                      <span>항목 추가</span>
                    </button>
                    
                    <button 
                      className={styles.addBtn}
                      onClick={() => {
                        if (selectedCompany) {
                          setExcelUploadCompany(selectedCompany)
                          setShowExcelUpload(true)
                        }
                      }}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <FileSpreadsheet size={18} />
                      <span>엑셀 업로드</span>
                    </button>
                    
                    <select 
                      className={styles.categoryFilter}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">모든 카테고리</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.searchBox}>
                    <Icons.Search />
                    <input
                      type="text"
                      placeholder="검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* 카테고리별 데이터 표시 */}
                {selectedCategory ? (
                  <div className={styles.dataSection}>
                    <h2>{selectedCategory}</h2>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>연번</th>
                            <th>항목</th>
                            <th>척도</th>
                            <th>수정된 척도</th>
                            <th>가중치</th>
                            <th>지수</th>
                            <th>작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMainData.map(item => (
                            <tr key={item.id}>
                              <td className={styles.centerCell}>{item.sequenceNumber}</td>
                              <td className={styles.itemCell}>{item.item}</td>
                              <td className={styles.centerCell}>{item.scale}</td>
                              <td className={styles.centerCell}>{item.modifiedScale}</td>
                              <td className={styles.centerCell}>{item.weight.toFixed(2)}</td>
                              <td className={styles.centerCell}>{item.index.toFixed(2)}</td>
                              <td>
                                <div className={styles.actions}>
                                  <button onClick={() => openModal('mainData', item)}>
                                    <Icons.Edit />
                                  </button>
                                  <button onClick={() => handleDelete('mainData', item.id)}>
                                    <Icons.Delete />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  categories.map(category => {
                    const categoryData = filteredMainData.filter(item => item.category === category)
                    if (categoryData.length === 0) return null
                    
                    return (
                      <div key={category} className={styles.dataSection}>
                        <div className={styles.categoryHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h2 style={{ margin: 0 }}>{category}</h2>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => {
                              setCategoryToDelete(category)
                              setShowDeleteCategoryModal(true)
                            }}
                            style={{ 
                              backgroundColor: '#6b7280',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #9ca3af',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '400',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              opacity: 0.8
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444'
                              e.currentTarget.style.opacity = '1'
                              e.currentTarget.style.borderColor = '#ef4444'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#6b7280'
                              e.currentTarget.style.opacity = '0.8'
                              e.currentTarget.style.borderColor = '#9ca3af'
                            }}
                          >
                            <Icons.Delete />
                            카테고리 전체 삭제 ({categoryData.length}개)
                          </button>
                        </div>
                        <div className={styles.tableContainer}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>연번</th>
                                <th>항목</th>
                                <th>척도</th>
                                <th>수정된 척도</th>
                                <th>가중치</th>
                                <th>지수</th>
                                <th>작업</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryData.map(item => (
                                <tr key={item.id}>
                                  <td className={styles.centerCell}>{item.sequenceNumber}</td>
                                  <td className={styles.itemCell}>{item.item}</td>
                                  <td className={styles.centerCell}>{item.scale}</td>
                                  <td className={styles.centerCell}>{item.modifiedScale}</td>
                                  <td className={styles.centerCell}>{item.weight.toFixed(2)}</td>
                                  <td className={styles.centerCell}>{item.index.toFixed(2)}</td>
                                  <td>
                                    <div className={styles.actions}>
                                      <button onClick={() => openModal('mainData', item)}>
                                        <Icons.Edit />
                                      </button>
                                      <button onClick={() => handleDelete('mainData', item.id)}>
                                        <Icons.Delete />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })
                )}
              </>
            ) : (
              // 분석결과 탭
              <>
                {/* AI 분석 실행 툴바 */}
                <div className={styles.analysisToolbar}>
                  <div className={styles.analysisLeft}>
                    <div className={styles.dateSelector}>
                      <Icons.Calendar />
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={analysisDate || ''}
                        onChange={(e) => setAnalysisDate(e.target.value)}
                        placeholder="날짜 선택"
                      />
                    </div>
                    <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.875rem' }}>
                      {analysisDate ? `선택된 날짜: ${analysisDate.split('T')[0]}` : '분석할 날짜를 선택하세요'}
                    </span>
                  </div>
                  <button 
                    className={styles.analyzeBtn}
                    onClick={() => {
                      // 날짜가 선택되지 않았으면 알림 모달 표시
                      if (!analysisDate) {
                        setShowDateAlertModal(true);
                        return;
                      }
                      setAnalysisCompleted(false);
                      setShowDetailedLog(false);
                      setAnalysisLogs([]);
                      setAnalysisProgress(0);
                      setAnalysisStatus({});
                      setShowAnalysisConfirmModal(true);
                    }}
                    disabled={isAnalyzing}
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: isAnalyzing ? 0.5 : 1
                    }}
                  >
                    <Icons.TrendUp />
                    <span>{isAnalyzing ? 'AI 분석 중...' : 'AI 분석 실행'}</span>
                  </button>
                </div>


                <div className={styles.divider} />

                <div className={styles.toolbar}>
                  <div className={styles.toolbarLeft}>
                    <button className={styles.addBtn} onClick={() => openModal('analysis')}>
                      <Icons.Plus />
                      <span>분석결과 수동 추가</span>
                    </button>
                  </div>
                  
                  <div className={styles.toolbarRight}>
                    <label style={{ marginRight: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                      날짜별 필터:
                    </label>
                    <select 
                      className={styles.dateFilter}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      <option value="">모든 날짜</option>
                      {/* 분석 데이터에서 고유한 날짜 추출 */}
                      {Array.from(new Set(analysisData.map(item => {
                        // ISO 날짜를 YYYY-MM-DD 형식으로 변환
                        const d = new Date(item.date);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      })))
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                        .map(date => (
                          <option key={date} value={date}>
                            {new Date(date + 'T00:00:00').toLocaleDateString('ko-KR')}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* 트렌드 차트 영역 */}
                <div className={styles.trendSection}>
                  <h2>Sub-index Trend: As of {new Date().toLocaleString('en-US', { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</h2>
                  
                  <div className={styles.categoryCards}>
                    {categories.map(category => {
                      const categoryAnalysis = analysisData.filter(item => {
                        if (selectedDate) {
                          // item.date (ISO 형식)를 YYYY-MM-DD로 변환하여 비교
                          const itemDate = new Date(item.date);
                          const formattedDate = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}-${String(itemDate.getDate()).padStart(2, '0')}`;
                          return item.category === category && formattedDate === selectedDate
                        }
                        return item.category === category
                      })
                      const totalIndex = categoryAnalysis.reduce((sum, item) => sum + item.index, 0)
                      const avgIndex = categoryAnalysis.length > 0 ? totalIndex / categoryAnalysis.length : 0
                      
                      return (
                        <div key={category} className={styles.categoryCard}>
                          <div className={styles.categoryHeader}>
                            <h3>{category}</h3>
                            <span className={`${styles.indexValue} ${avgIndex >= 0 ? styles.positive : styles.negative}`}>
                              {avgIndex >= 0 ? <Icons.TrendUp /> : <Icons.TrendDown />}
                              {avgIndex.toFixed(2)}
                            </span>
                          </div>
                          <div className={styles.categoryStats}>
                            <div className={styles.statItem}>
                              <span>항목 수</span>
                              <strong>{categoryAnalysis.length}</strong>
                            </div>
                            <div className={styles.statItem}>
                              <span>총 지수</span>
                              <strong>{totalIndex.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 상세 분석 데이터 테이블 */}
                <div className={styles.dataSection}>
                  <h2>분석 상세 데이터</h2>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>날짜</th>
                          <th>카테고리</th>
                          <th>항목</th>
                          <th>척도</th>
                          <th>수정된 척도</th>
                          <th>가중치</th>
                          <th>지수</th>
                          <th>작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisData
                          .filter(item => {
                            if (!selectedDate) return true;
                            // item.date (ISO 형식)를 YYYY-MM-DD로 변환하여 비교
                            const itemDate = new Date(item.date);
                            const formattedDate = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}-${String(itemDate.getDate()).padStart(2, '0')}`;
                            return formattedDate === selectedDate;
                          })
                          .map(item => (
                          <tr key={item.id}>
                            <td>{new Date(item.date).toLocaleDateString()}</td>
                            <td>{item.category}</td>
                            <td>{item.item}</td>
                            <td className={styles.centerCell}>{item.scale}</td>
                            <td className={styles.centerCell}>{item.modifiedScale}</td>
                            <td className={styles.centerCell}>{item.weight.toFixed(2)}</td>
                            <td className={styles.centerCell}>
                              <span className={item.index >= 0 ? styles.positive : styles.negative}>
                                {item.index.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              <div className={styles.actions}>
                                <button onClick={() => openModal('analysis', item)}>
                                  <Icons.Edit />
                                </button>
                                <button onClick={() => handleDelete('analysis', item.id)}>
                                  <Icons.Delete />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 리포트 관리 섹션 */}
                <div className={styles.systemPromptSection} style={{ marginTop: '30px' }}>
                  <div className={styles.sectionHeader}>
                    <h3>
                      <Icons.Document />
                      <span>AI 분석 리포트</span>
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <select
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value as 'NOW' | 'INSIGHT' | 'ALL')}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="ALL">전체 리포트</option>
                        <option value="NOW">Now 리포트</option>
                        <option value="INSIGHT">Insight 리포트</option>
                      </select>
                    </div>
                  </div>

                  {/* 리포트 목록 */}
                  <div style={{ marginTop: '20px' }}>
                    {reports && reports.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reports
                          .filter(report => selectedReportType === 'ALL' || report.type === selectedReportType)
                          .sort((a, b) => {
                            // INSIGHT 리포트를 NOW보다 먼저 표시
                            if (a.type === 'INSIGHT' && b.type === 'NOW') return -1
                            if (a.type === 'NOW' && b.type === 'INSIGHT') return 1
                            // 같은 타입이면 날짜순 정렬
                            return new Date(b.date).getTime() - new Date(a.date).getTime()
                          })
                          .map(report => (
                          <div key={report.id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            backgroundColor: '#f9fafb'
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '12px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  backgroundColor: report.type === 'NOW' ? '#dbeafe' : '#fef3c7',
                                  color: report.type === 'NOW' ? '#1e40af' : '#92400e',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}>
                                  {report.type}
                                </span>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                  {new Date(report.date).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    const textarea = document.createElement('textarea')
                                    textarea.value = report.content
                                    document.body.appendChild(textarea)
                                    textarea.select()
                                    document.execCommand('copy')
                                    document.body.removeChild(textarea)
                                    setSuccessMessage('리포트가 클립보드에 복사되었습니다.')
                                    setTimeout(() => setSuccessMessage(null), 2000)
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  복사
                                </button>
                                <button
                                  onClick={() => {
                                    setReportToDelete(report)
                                    setShowDeleteReportModal(true)
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                            <div style={{
                              backgroundColor: 'white',
                              padding: '12px',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb',
                              maxHeight: '300px',
                              overflowY: 'auto',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {report.content || '리포트 내용이 없습니다.'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        <Icons.Document />
                        <p style={{ margin: '8px 0 0 0' }}>
                          {selectedCompany 
                            ? selectedDate 
                              ? `${new Date(selectedDate).toLocaleDateString('ko-KR')}에 생성된 AI 분석 리포트가 없습니다.`
                              : '날짜를 선택하면 AI 분석 리포트를 확인할 수 있습니다.'
                            : '회사를 선택하면 AI 분석 리포트를 확인할 수 있습니다.'
                          }
                        </p>
                        {selectedCompany && selectedDate && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                            AI 분석을 실행하여 리포트를 생성해보세요.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* 모달 */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalType === 'company' 
                  ? (editingItem ? '기업 수정' : '새 기업 추가')
                  : modalType === 'mainData'
                  ? (editingItem ? '분석항목 수정' : '새 분석항목 추가')
                  : (editingItem ? '분석결과 수정' : '새 분석결과 추가')}
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <Icons.Close />
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalType === 'company' ? (
                <>
                  <div className={styles.formGroup}>
                    <label>기업명 (영문) *</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="Samsung Electronics"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>기업명 (한글)</label>
                    <input
                      type="text"
                      value={companyForm.nameKr}
                      onChange={(e) => setCompanyForm({ ...companyForm, nameKr: e.target.value })}
                      placeholder="삼성전자"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>설명</label>
                    <textarea
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                      placeholder="기업 설명 입력..."
                      rows={4}
                    />
                  </div>
                </>
              ) : modalType === 'mainData' ? (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>연번 *</label>
                      <input
                        type="number"
                        value={mainDataForm.sequenceNumber}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, sequenceNumber: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>구분 *</label>
                      <input
                        type="text"
                        value={mainDataForm.category}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, category: e.target.value })}
                        placeholder="I.기업내생변수"
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>항목 *</label>
                    <input
                      type="text"
                      value={mainDataForm.item}
                      onChange={(e) => setMainDataForm({ ...mainDataForm, item: e.target.value })}
                      placeholder="항목명 입력..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>질문 *</label>
                    <textarea
                      value={mainDataForm.question}
                      onChange={(e) => setMainDataForm({ ...mainDataForm, question: e.target.value })}
                      placeholder="질문 내용 입력..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>척도</label>
                      <input
                        type="number"
                        value={mainDataForm.scale}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, scale: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>수정된 척도</label>
                      <input
                        type="number"
                        value={mainDataForm.modifiedScale}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, modifiedScale: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>누적점수</label>
                      <input
                        type="number"
                        value={mainDataForm.cumulativeScore}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, cumulativeScore: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>일반법칙</label>
                    <textarea
                      value={mainDataForm.generalRule}
                      onChange={(e) => setMainDataForm({ ...mainDataForm, generalRule: e.target.value })}
                      placeholder="일반법칙 입력..."
                      rows={2}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>가중치</label>
                      <input
                        type="number"
                        step="0.01"
                        value={mainDataForm.weight}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, weight: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>지수</label>
                      <input
                        type="number"
                        step="0.01"
                        value={mainDataForm.index}
                        onChange={(e) => setMainDataForm({ ...mainDataForm, index: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>출처</label>
                    <input
                      type="text"
                      value={mainDataForm.source}
                      onChange={(e) => setMainDataForm({ ...mainDataForm, source: e.target.value })}
                      placeholder="출처 입력..."
                    />
                  </div>
                </>
              ) : (
                // Analysis Form
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>날짜 *</label>
                      <input
                        type="date"
                        value={analysisForm.date}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, date: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>카테고리 *</label>
                      <select
                        value={analysisForm.category}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, category: e.target.value })}
                      >
                        <option value="">선택...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>항목 *</label>
                    <input
                      type="text"
                      value={analysisForm.item}
                      onChange={(e) => setAnalysisForm({ ...analysisForm, item: e.target.value })}
                      placeholder="항목명 입력..."
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>척도</label>
                      <input
                        type="number"
                        value={analysisForm.scale}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, scale: parseInt(e.target.value) })}
                        min="-3"
                        max="3"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>수정된 척도</label>
                      <input
                        type="number"
                        value={analysisForm.modifiedScale}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, modifiedScale: parseInt(e.target.value) })}
                        min="-3"
                        max="3"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>누적점수</label>
                      <input
                        type="number"
                        value={analysisForm.cumulativeScore}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, cumulativeScore: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>가중치</label>
                      <input
                        type="number"
                        step="0.01"
                        value={analysisForm.weight}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, weight: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>지수</label>
                      <input
                        type="number"
                        step="0.01"
                        value={analysisForm.index}
                        onChange={(e) => setAnalysisForm({ ...analysisForm, index: parseFloat(e.target.value) })}
                        readOnly
                        title="자동 계산됨: 수정된 척도 × 가중치"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                취소
              </button>
              <button 
                className={styles.saveBtn} 
                onClick={
                  modalType === 'company' ? handleCompanySave : 
                  modalType === 'mainData' ? handleMainDataSave :
                  handleAnalysisSave
                }
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 정보 수정 모달 */}
      {showUserEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUserEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>계정 설정</h2>
              <button className={styles.closeBtn} onClick={() => setShowUserEditModal(false)}>
                <Icons.Close />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>이름</label>
                  <input
                    type="text"
                    value={userEditForm.name}
                    onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                    placeholder="이름 입력"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>이메일</label>
                  <input
                    type="email"
                    value={userEditForm.email}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                    placeholder="이메일 주소"
                    disabled
                  />
                </div>
              </div>

              <div className={styles.divider} />
              
              <div style={{ marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>비밀번호 변경</h3>
                <small className={styles.formHint}>비밀번호를 변경하려면 아래 필드를 입력하세요</small>
              </div>
              
              <div className={styles.formGroup}>
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  value={userEditForm.currentPassword}
                  onChange={(e) => setUserEditForm({ ...userEditForm, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호 입력"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    value={userEditForm.newPassword}
                    onChange={(e) => setUserEditForm({ ...userEditForm, newPassword: e.target.value })}
                    placeholder="6자 이상"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>비밀번호 확인</label>
                  <input
                    type="password"
                    value={userEditForm.confirmPassword}
                    onChange={(e) => setUserEditForm({ ...userEditForm, confirmPassword: e.target.value })}
                    placeholder="다시 입력"
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowUserEditModal(false)}>
                취소
              </button>
              <button 
                className={styles.saveBtn}
                onClick={async () => {
                  setLoading(true)
                  try {
                    const token = localStorage.getItem('token')
                    
                    // 이름 업데이트
                    if (userEditForm.name && userEditForm.name !== user?.name) {
                      const nameRes = await fetch('/api/auth/update-profile', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name: userEditForm.name })
                      })
                      
                      if (nameRes.ok) {
                        const updatedUser = await nameRes.json()
                        setUser(updatedUser)
                        localStorage.setItem('user', JSON.stringify(updatedUser))
                      } else if (nameRes.status === 401) {
                        // 401 에러시 로그인 페이지로 리다이렉션
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        router.push('/login')
                        return
                      }
                    }
                    
                    // 비밀번호 변경
                    if (userEditForm.currentPassword && userEditForm.newPassword) {
                      if (userEditForm.newPassword !== userEditForm.confirmPassword) {
                        setError('새 비밀번호가 일치하지 않습니다')
                        setLoading(false)
                        return
                      }
                      
                      const pwRes = await fetch('/api/auth/change-password', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          currentPassword: userEditForm.currentPassword,
                          newPassword: userEditForm.newPassword
                        })
                      })
                      
                      if (!pwRes.ok) {
                        const data = await pwRes.json()
                        
                        // 401 에러시 로그인 페이지로 리다이렉션
                        if (pwRes.status === 401) {
                          localStorage.removeItem('token')
                          localStorage.removeItem('user')
                          router.push('/login')
                          return
                        }
                        
                        throw new Error(data.error || '비밀번호 변경에 실패했습니다')
                      }
                    }
                    
                    setShowUserEditModal(false)
                    setUserEditForm({
                      name: '',
                      email: '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  } catch (err: any) {
                    setError(err.message)
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 엑셀 업로드 모달 */}
      {showExcelUpload && excelUploadCompany && (
        <ExcelUpload
          isOpen={showExcelUpload}
          onClose={() => {
            setShowExcelUpload(false)
            setExcelUploadCompany(null)
          }}
          companyId={excelUploadCompany.id}
          companyName={excelUploadCompany.nameKr || excelUploadCompany.name}
          onSuccess={() => {
            setShowExcelUpload(false)
            setExcelUploadCompany(null)
            setSuccessMessage('엑셀 데이터가 성공적으로 업로드되었습니다.')
            if (selectedCompany) {
              loadCompanyData(selectedCompany.id) // 데이터 새로고침
            }
          }}
        />
      )}

      {/* 카테고리 삭제 확인 모달 */}
      {showDeleteCategoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                카테고리 삭제 확인
              </h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowDeleteCategoryModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#991b1b' }}>
                  정말로 "{categoryToDelete}" 카테고리를 삭제하시겠습니까?
                </p>
                <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  • 카테고리에 속한 <strong>{mainData.filter(item => item.category === categoryToDelete).length}개</strong>의 항목이 모두 삭제됩니다.
                </p>
                <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  • 해당 카테고리의 모든 분석 결과도 함께 삭제됩니다.
                </p>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
                  ⚠️ 이 작업은 되돌릴 수 없습니다!
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  삭제를 확인하려면 카테고리 이름을 입력하세요:
                </label>
                <input
                  type="text"
                  placeholder={categoryToDelete}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  onInput={(e) => {
                    const input = e.currentTarget
                    if (input.value === categoryToDelete) {
                      input.style.borderColor = '#10b981'
                      input.style.backgroundColor = '#f0fdf4'
                    } else {
                      input.style.borderColor = '#d1d5db'
                      input.style.backgroundColor = 'white'
                    }
                  }}
                  id="delete-category-confirm-input"
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowDeleteCategoryModal(false)}
              >
                취소
              </button>
              <button 
                onClick={async () => {
                  const input = document.getElementById('delete-category-confirm-input') as HTMLInputElement
                  if (input?.value !== categoryToDelete) {
                    setError('카테고리 이름이 일치하지 않습니다.')
                    return
                  }
                  
                  setLoading(true)
                  try {
                    const token = localStorage.getItem('token')
                    const res = await fetch(`/api/admin/main-data/delete-category?companyId=${selectedCompany?.id}&category=${encodeURIComponent(categoryToDelete)}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    
                    if (res.ok) {
                      const result = await res.json()
                      setSuccessMessage(result.message)
                      if (selectedCompany) {
                        loadCompanyData(selectedCompany.id)
                      }
                      setShowDeleteCategoryModal(false)
                    } else {
                      const error = await res.json()
                      setError(error.error || '삭제 실패')
                    }
                  } catch (err) {
                    setError('카테고리 삭제 중 오류가 발생했습니다.')
                  } finally {
                    setLoading(false)
                  }
                }}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 미선택 알림 모달 */}
      {showDateAlertModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ 
            maxWidth: '450px',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* 경고 아이콘 */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {/* 제목 */}
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '0.75rem'
              }}>
                날짜를 선택해주세요
              </h2>
              
              {/* 설명 */}
              <p style={{
                fontSize: '0.95rem',
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}>
                AI 분석을 실행하려면 먼저 분석할 날짜를 선택해야 합니다.
                날짜를 선택한 후 다시 시도해주세요.
              </p>
              
              {/* 확인 버튼 */}
              <button
                onClick={() => {
                  setShowDateAlertModal(false);
                  // 날짜 입력 필드에 포커스
                  setTimeout(() => {
                    dateInputRef.current?.focus();
                    dateInputRef.current?.showPicker?.();
                  }, 100);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 분석 확인 모달 */}
      {showAnalysisConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ 
            maxWidth: '600px', 
            height: '80vh',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div className={styles.modalHeader}>
              <h2>AI 분석 실행 확인</h2>
              <button 
                className={styles.closeBtn} 
                onClick={() => {
                  if (!isAnalyzing) {
                    setShowAnalysisConfirmModal(false);
                    setShowDetailedLog(false);
                    setAnalysisLogs([]);
                    setAnalysisCompleted(false);
                  }
                }}
                disabled={isAnalyzing}
                title={isAnalyzing ? '분석 중에는 닫을 수 없습니다' : '닫기'}
              >
                <Icons.Close />
              </button>
            </div>

            <div className={styles.modalBody} style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '1.5rem',
              minHeight: 0
            }}>
              {!isAnalyzing && !analysisCompleted ? (
                <>
                  <div style={{ 
                    padding: '1.5rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
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
                          선택한 날짜: <strong>{analysisDate ? analysisDate.split('T')[0] : '날짜 미선택'}</strong>
                        </p>
                        <p style={{ margin: 0, color: '#78350f', fontSize: '0.875rem' }}>
                          {mainData.length}개의 분석 항목에 대해 AI 분석이 실행됩니다.
                          기존 분석 데이터가 있다면 덮어쓰여집니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#374151' }}>
                      분석 대상 카테고리:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {categories.map(cat => {
                        const count = mainData.filter(item => item.category === cat).length;
                        return (
                          <span key={cat} style={{ 
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#fff',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            color: '#374151',
                            border: '1px solid #e5e7eb'
                          }}>
                            {cat} ({count}개)
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (isAnalyzing || analysisCompleted) ? (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: '#111827' 
                      }}>
                        AI 분석 진행 중...
                      </span>
                      <span style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600',
                        color: '#3b82f6' 
                      }}>
                        {Math.round(analysisProgress)}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '20px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ 
                        width: `${analysisProgress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                        transition: 'width 0.5s ease-in-out',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          animation: 'shimmer 2s infinite'
                        }} />
                      </div>
                    </div>
                  </div>

                  {Object.keys(analysisStatus).length > 0 && (
                    <div style={{ 
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                      }}>
                        {Object.entries(analysisStatus).map(([key, status]) => (
                          <div key={key} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            marginBottom: '0.25rem',
                            padding: '0.25rem'
                          }}>
                            <span style={{ 
                              display: 'inline-block',
                              width: '16px',
                              height: '16px',
                              lineHeight: '16px',
                              textAlign: 'center',
                              borderRadius: '50%',
                              backgroundColor: status.status === 'success' ? '#d1fae5' : 
                                            status.status === 'error' ? '#fee2e2' : '#f3f4f6',
                              color: status.status === 'success' ? '#065f46' : 
                                    status.status === 'error' ? '#991b1b' : '#6b7280',
                              fontSize: '0.625rem',
                              fontWeight: '600'
                            }}>
                              {status.status === 'success' ? '✓' : 
                               status.status === 'error' ? '✗' : '●'}
                            </span>
                            <span style={{ flex: 1 }}>
                              항목 {key}: {status.item || '분석 중...'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#eff6ff',
                    borderRadius: '0.5rem',
                    fontSize: '0.813rem',
                    color: '#1e40af',
                    textAlign: 'center'
                  }}>
                    {analysisCompleted ? (
                      <span style={{ color: '#059669', fontWeight: '600' }}>
                        ✓ AI 분석이 완료되었습니다!
                      </span>
                    ) : (
                      'AI가 각 항목을 분석하고 있습니다. 잠시만 기다려주세요...'
                    )}
                  </div>
                  
                  {/* 자세히 보기 버튼 */}
                  <div style={{ 
                    marginTop: '1rem',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => setShowDetailedLog(!showDetailedLog)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#3b82f6',
                        backgroundColor: 'transparent',
                        border: '1px solid #3b82f6',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showDetailedLog ? (
                          <polyline points="18 15 12 9 6 15" />
                        ) : (
                          <polyline points="6 9 12 15 18 9" />
                        )}
                      </svg>
                      {showDetailedLog ? '로그 숨기기' : '자세히 보기'}
                    </button>
                  </div>
                  
                  {/* 상세 로그 영역 */}
                  {showDetailedLog && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '0.5rem',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.7rem' }}>
                        [ANALYSIS LOG]
                      </div>
                      <div style={{
                        maxHeight: '250px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: '0.5rem'
                      }}>
                        {analysisLogs.length > 0 ? (
                          analysisLogs.map((log, index) => (
                            <div key={index} style={{ 
                              marginBottom: '0.25rem',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {log}
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#475569' }}>분석 로그가 여기에 표시됩니다...</div>
                        )}
                        {Object.entries(analysisStatus).map(([key, status]) => (
                          <div key={key} style={{ 
                            marginBottom: '0.25rem',
                            color: status.status === 'success' ? '#10b981' : 
                                  status.status === 'error' ? '#ef4444' : '#94a3b8'
                          }}>
                            [{new Date().toLocaleTimeString()}] 항목 {key}: {status.item} - {status.status === 'success' ? '완료' : status.status === 'error' ? '실패' : '분석 중'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {(!isAnalyzing || analysisCompleted) && (
              <div className={styles.modalFooter} style={{
                borderTop: '1px solid #e5e7eb',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                backgroundColor: '#fff',
                borderRadius: '0 0 0.75rem 0.75rem',
                flexShrink: 0
              }}>
                <button 
                  className={styles.cancelBtn} 
                  onClick={() => {
                    setShowAnalysisConfirmModal(false);
                    setShowDetailedLog(false);
                    setAnalysisLogs([]);
                    setAnalysisCompleted(false);
                  }}
                >
                  {analysisCompleted ? '닫기' : '취소'}
                </button>
                {!analysisCompleted && (
                  <button 
                    className={styles.saveBtn}
                    onClick={async () => {
                      setIsAnalyzing(true);
                      setAnalysisProgress(0);
                      setAnalysisStatus({});
                      setAnalysisLogs([]);
                      
                      // 초기 로그 추가
                      const addLog = (message: string) => {
                        setAnalysisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
                      };
                      
                      addLog('AI 분석 시작...');
                      addLog(`분석 대상: ${selectedCompany?.nameKr || selectedCompany?.name}`);
                      addLog(`분석 날짜: ${analysisDate}`);
                      addLog(`총 ${mainData.length}개 항목 분석 예정`);
                      
                      // 진행률 시뮬레이션
                      const progressInterval = setInterval(() => {
                        setAnalysisProgress(prev => {
                          if (prev >= 90) return prev;
                          const increment = Math.random() * 10;
                          if (prev + increment > 30 && prev < 30) {
                            addLog('OpenAI API 연결 중...');
                          }
                          if (prev + increment > 50 && prev < 50) {
                            addLog('데이터 분석 진행 중...');
                          }
                          if (prev + increment > 70 && prev < 70) {
                            addLog('분석 결과 저장 중...');
                          }
                          return prev + increment;
                        });
                      }, 500);
                    
                    try {
                      const token = localStorage.getItem('token');
                      
                      // 모든 분석 항목 가져오기
                      const items = mainData.map(item => item.sequenceNumber);
                      
                      addLog('API 요청 전송...');
                      const apiUrl = '/api/analyze';
                      addLog(`📡 요청 URL: ${window.location.origin}${apiUrl}`);
                      
                      const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          companyId: selectedCompany?.id,
                          date: analysisDate,
                          selectionMode: 'all',
                          items: items
                        })
                      });
                      
                      // 시뮬레이션 중단
                      clearInterval(progressInterval);
                      
                      // 응답 상태 확인
                      addLog(`📊 응답 상태: ${res.status} ${res.statusText}`);
                      addLog(`📍 응답 URL: ${res.url}`);
                      addLog(`📝 Content-Type: ${res.headers.get('content-type')}`);
                      
                      // 응답 텍스트 먼저 확인
                      const responseText = await res.text();
                      
                      // HTML 응답인지 확인
                      if (responseText.startsWith('<') || responseText.includes('<!DOCTYPE')) {
                        addLog('⚠️ HTML 응답 감지 - API 엔드포인트 문제 가능성');
                        addLog('📄 응답 내용 (첫 500자):');
                        addLog(responseText.substring(0, 500));
                        
                        // HTML 내용에서 에러 메시지 추출 시도
                        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
                        if (titleMatch) {
                          addLog(`📌 페이지 제목: ${titleMatch[1]}`);
                        }
                        
                        throw new Error('API가 HTML을 반환했습니다. 서버 설정이나 라우팅 문제일 수 있습니다.');
                      }
                      
                      // JSON 파싱 시도
                      let result;
                      try {
                        result = JSON.parse(responseText);
                      } catch (parseError) {
                        addLog('❌ JSON 파싱 실패');
                        addLog(`응답 내용: ${responseText.substring(0, 200)}`);
                        throw new Error('잘못된 API 응답 형식');
                      }
                      
                      if (res.ok) {
                        setAnalysisProgress(100);
                        
                        // 분석 상태 정보 설정
                        if (result.status) {
                          setAnalysisStatus(result.status);
                        }
                        
                        addLog(`✓ 분석 완료! ${result.newData?.length || 0}개 항목 처리됨`);
                        addLog('모든 분석이 성공적으로 완료되었습니다.');
                        
                        setSuccessMessage(`AI 분석이 완료되었습니다. ${result.newData?.length || 0}개 항목 분석 완료`);
                        setAnalysisCompleted(true);
                        
                        // 분석 데이터 다시 로드
                        if (selectedCompany) {
                          loadCompanyData(selectedCompany.id);
                          // 리포트도 다시 로드
                          if (analysisDate) {
                            // selectedDate를 analysisDate로 업데이트
                            setSelectedDate(analysisDate);
                            loadReports(selectedCompany.id, analysisDate);
                          }
                        }
                      } else {
                        const error = await res.json();
                        
                        // 오류 상세 정보 로그
                        addLog('═══════════════════════════════════════');
                        addLog('❌ AI 분석 실패 - 상세 오류 정보');
                        addLog('═══════════════════════════════════════');
                        
                        if (error.status) {
                          // 각 항목별 오류 확인
                          Object.entries(error.status).forEach(([key, value]: [string, any]) => {
                            if (value.status === 'error') {
                              addLog(`📍 항목 ${key}: ${value.item}`);
                              addLog(`   ⚠️ 오류 유형: ${value.errorType || 'UNKNOWN'}`);
                              addLog(`   💬 오류 메시지: ${value.message}`);
                              if (value.details) {
                                if (value.details.statusCode) {
                                  addLog(`   📡 HTTP 상태 코드: ${value.details.statusCode}`);
                                }
                                if (value.details.apiErrorCode) {
                                  addLog(`   🔑 API 오류 코드: ${value.details.apiErrorCode}`);
                                }
                                if (value.details.apiErrorMessage) {
                                  addLog(`   📝 API 오류 메시지: ${value.details.apiErrorMessage}`);
                                }
                              }
                              addLog('───────────────────────────────────────');
                            }
                          });
                        } else {
                          addLog(`✗ 일반 오류: ${error.error || 'AI 분석에 실패했습니다'}`);
                        }
                        
                        addLog('═══════════════════════════════════════');
                        addLog('💡 해결 방법:');
                        
                        // 오류 유형에 따른 해결책 제시
                        const hasApiKeyError = error.status && Object.values(error.status).some((v: any) => 
                          v.errorType === 'INVALID_API_KEY' || v.errorType === 'AUTH_ERROR'
                        );
                        const hasQuotaError = error.status && Object.values(error.status).some((v: any) => 
                          v.errorType === 'QUOTA_EXCEEDED'
                        );
                        const hasRateLimitError = error.status && Object.values(error.status).some((v: any) => 
                          v.errorType === 'RATE_LIMIT'
                        );
                        const hasNetworkError = error.status && Object.values(error.status).some((v: any) => 
                          v.errorType === 'NETWORK_ERROR'
                        );
                        
                        if (hasApiKeyError) {
                          addLog('   1. GPT 설정에서 올바른 API 키를 입력하세요');
                          addLog('   2. OpenAI 계정에서 API 키를 재발급 받으세요');
                        } else if (hasQuotaError) {
                          addLog('   1. OpenAI 계정의 결제 정보를 확인하세요');
                          addLog('   2. API 사용 한도를 늘리거나 결제 수단을 등록하세요');
                        } else if (hasRateLimitError) {
                          addLog('   1. 1-2분 후에 다시 시도하세요');
                          addLog('   2. API 호출 간격을 늘려주세요');
                        } else if (hasNetworkError) {
                          addLog('   1. 인터넷 연결 상태를 확인하세요');
                          addLog('   2. 방화벽이나 프록시 설정을 확인하세요');
                        } else {
                          addLog('   1. 잠시 후 다시 시도하세요');
                          addLog('   2. 문제가 지속되면 시스템 관리자에게 문의하세요');
                        }
                        addLog('═══════════════════════════════════════');
                        
                        setError(error.error || 'AI 분석에 실패했습니다. 상세 로그를 확인하세요.');
                        setAnalysisCompleted(true);
                      }
                    } catch (err) {
                      clearInterval(progressInterval);
                      console.error('AI 분석 오류:', err);
                      
                      addLog('═══════════════════════════════════════');
                      addLog('❌ 예기치 않은 오류 발생');
                      addLog('═══════════════════════════════════════');
                      addLog(`✗ 오류 메시지: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
                      if (err instanceof Error && err.stack) {
                        addLog('📋 스택 추적:');
                        err.stack.split('\n').slice(0, 5).forEach(line => {
                          addLog(`   ${line}`);
                        });
                      }
                      addLog('═══════════════════════════════════════');
                      
                      setError('AI 분석 중 오류가 발생했습니다. 상세 로그를 확인하세요.');
                      setAnalysisCompleted(true);
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white'
                    }}
                  >
                    <Icons.TrendUp />
                    분석 시작
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GPT 설정 모달 */}
      {showGPTModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icons.Sparkles />
                </div>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>GPT API 설정</h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>OpenAI API 키를 설정하세요</p>
                </div>
              </div>
              <button
                onClick={() => setShowGPTModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icons.Close />
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                API Key
              </label>
              <input
                type="password"
                value={gptApiKey}
                onChange={(e) => setGptApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '8px'
              }}>
                OpenAI 대시보드에서 API 키를 생성하고 입력하세요.
                <a href="https://platform.openai.com/api-keys" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{
                     color: '#6366f1',
                     marginLeft: '4px',
                     textDecoration: 'none'
                   }}>
                  키 생성하기 →
                </a>
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowGPTModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              >
                취소
              </button>
              <button
                onClick={saveGPTSettings}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {/* 리포트 삭제 확인 모달 */}
      {showDeleteReportModal && reportToDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteReportModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '480px',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: 'none'
          }}>
            {/* 모달 헤더 */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 8px 0',
                  lineHeight: '1.3'
                }}>리포트 삭제 확인</h2>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.5'
                }}>선택한 리포트를 영구적으로 삭제하시겠습니까?</p>
              </div>
              <button
                onClick={() => setShowDeleteReportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                  color: '#6b7280'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Icons.Close />
              </button>
            </div>

            {/* 리포트 정보 */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    backgroundColor: reportToDelete.type === 'NOW' ? '#dbeafe' : '#fef3c7',
                    color: reportToDelete.type === 'NOW' ? '#1e40af' : '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {reportToDelete.type}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(reportToDelete.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: '#374151',
                  margin: 0,
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {reportToDelete.content?.substring(0, 100) || ''}...
                </p>
              </div>
              
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '16px'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: '#991b1b',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠️</span>
                  <span>이 작업은 되돌릴 수 없습니다. 삭제된 리포트는 복구할 수 없습니다.</span>
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteReportModal(false)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await deleteReportWithoutConfirm(reportToDelete.id)
                  setShowDeleteReportModal(false)
                  setReportToDelete(null)
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {successMessage && (
        <div className={styles.successToast}>
          {successMessage}
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}
    </div>
  )
}