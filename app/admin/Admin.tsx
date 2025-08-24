'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
    </svg>
  ),
  Add: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
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

export default function AdminDashboard() {
  const router = useRouter()
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [draggedCompany, setDraggedCompany] = useState<Company | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
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
    })
    .catch(() => {
      router.push('/login')
    })
  }, [router])

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
    } catch (err) {
      console.error('Error loading company data:', err)
      setError('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
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
        console.log('기업 순서 저장 성공')
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
            date: selectedDate,
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
        throw new Error(data.error)
      }

      setShowModal(false)
      loadData()
    } catch (err: any) {
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

  if (!isAuthenticated || loading) {
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
          <nav className={styles.globalNav}>
            <a href="/admin" className={`${styles.navLink} ${styles.active}`}>
              <Icons.Company />
              <span>기업 관리</span>
            </a>
            <a href="/admin/users" className={styles.navLink}>
              <Icons.Users />
              <span>사용자 관리</span>
            </a>
          </nav>
        </div>
        <div className={styles.headerRight}>
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
                  onClick={() => setActiveTab('results')}
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
                            onClick={async () => {
                              if (confirm(`정말로 "${category}" 카테고리의 모든 항목을 삭제하시겠습니까?\n총 ${categoryData.length}개 항목이 삭제됩니다.`)) {
                                setLoading(true)
                                try {
                                  const token = localStorage.getItem('token')
                                  const res = await fetch(`/api/admin/main-data/delete-category?companyId=${selectedCompany?.id}&category=${encodeURIComponent(category)}`, {
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
                                  } else {
                                    const error = await res.json()
                                    setError(error.error || '삭제 실패')
                                  }
                                } catch (err) {
                                  setError('카테고리 삭제 중 오류가 발생했습니다.')
                                } finally {
                                  setLoading(false)
                                }
                              }
                            }}
                            style={{ 
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
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
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.875rem' }}>
                      분석할 날짜를 선택하세요
                    </span>
                  </div>
                  <button 
                    className={styles.analyzeBtn}
                    onClick={async () => {
                      if (!selectedDate) {
                        setError('분석할 날짜를 선택해주세요');
                        return;
                      }
                      
                      if (confirm(`${selectedDate} 날짜로 AI 분석을 실행하시겠습니까?\n기존 분석 데이터가 있다면 덮어쓰여집니다.`)) {
                        setLoading(true);
                        try {
                          const token = localStorage.getItem('token');
                          
                          // 모든 분석 항목 가져오기
                          const items = mainData.map(item => item.sequenceNumber);
                          
                          const res = await fetch('/api/analyze', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              companyId: selectedCompany?.id,
                              date: selectedDate,
                              selectionMode: 'all',
                              items: items
                            })
                          });
                          
                          if (res.ok) {
                            const result = await res.json();
                            setSuccessMessage(`AI 분석이 완료되었습니다. ${result.analyzed}개 항목 분석 완료`);
                            // 분석 데이터 다시 로드
                            if (selectedCompany) {
                              loadCompanyData(selectedCompany.id);
                            }
                          } else {
                            const error = await res.json();
                            setError(error.error || 'AI 분석에 실패했습니다');
                          }
                        } catch (err) {
                          console.error('AI 분석 오류:', err);
                          setError('AI 분석 중 오류가 발생했습니다');
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    disabled={loading || !selectedDate}
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: loading || !selectedDate ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: loading || !selectedDate ? 0.5 : 1
                    }}
                  >
                    <Icons.TrendUp />
                    <span>{loading ? 'AI 분석 중...' : 'AI 분석 실행'}</span>
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
                      {Array.from(new Set(analysisData.map(item => item.date)))
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                        .map(date => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString()}
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
                          return item.category === category && item.date === selectedDate
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
                          .filter(item => selectedDate ? item.date === selectedDate : true)
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

      {/* 에러 메시지 */}
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