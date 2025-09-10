'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './Admin.module.css'

// 아이콘 컴포넌트
const Icons = {
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
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  ),
  Company: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
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
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zM3 12a1 1 0 011 1v1h1a1 1 0 110 2H4v1a1 1 0 11-2 0v-1H1a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14 7l4.256 1.033a1 1 0 010 1.934L14 11l-1.033 4.256a1 1 0 01-1.934 0L10 11l-4.256-1.033a1 1 0 010-1.934L10 7l1.033-4.256A1 1 0 0112 2z"/>
    </svg>
  )
}

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
      <text x="16" y="22" textAnchor="middle" fill="#5f6368" fontSize="14" fontWeight="600">CT</text>
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

export default function UserManagement() {
  const router = useRouter()
  const pathname = usePathname()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN'
  })
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showGPTModal, setShowGPTModal] = useState(false)
  const [gptApiKey, setGptApiKey] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    // 사용자 정보 로드
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    
    // 사용자 목록 로드
    loadUsers()
  }, [])

  // 사용자 목록 로드
  const loadUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (err) {
      console.error('사용자 목록 로드 오류:', err)
      setError('사용자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 사용자 모달 열기
  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setUserForm({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role
      })
    } else {
      setEditingUser(null)
      setUserForm({
        email: '',
        password: '',
        name: '',
        role: 'USER'
      })
    }
    setShowUserModal(true)
  }

  // 사용자 저장
  const handleUserSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const res = await fetch('/api/admin/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(
          editingUser 
            ? { id: editingUser.id, ...userForm }
            : userForm
        )
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      setShowUserModal(false)
      loadUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 사용자 삭제
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: userId })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      loadUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
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
          {/* 사용자 메뉴 */}
          <div className={styles.userMenuWrapper}>
            <button 
              className={styles.userMenuBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={styles.avatar}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span>{user?.name || user?.email}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 7.5L3 4.5h6L6 7.5z"/>
              </svg>
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.dropdownName}>{user?.name || '사용자'}</div>
                    <div className={styles.dropdownEmail}>{user?.email}</div>
                    <div className={styles.dropdownRole}>
                      <span className={`${styles.roleBadge} ${user?.role === 'ADMIN' ? styles.admin : styles.user}`}>
                        {user?.role === 'ADMIN' ? '관리자' : '사용자'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.dropdownDivider}></div>
                <button className={styles.dropdownItem} onClick={handleLogout}>
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
        <div className={styles.userManagement}>
          <div className={styles.userHeader}>
            <h2>사용자 계정 관리</h2>
            <button className={styles.addBtn} onClick={() => openUserModal()}>
              <Icons.Plus />
              <span>새 사용자 추가</span>
            </button>
          </div>
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>로딩 중...</p>
            </div>
          ) : (
            <div className={styles.userTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>권한</th>
                    <th>가입일</th>
                    <th>마지막 로그인</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name || '-'}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.admin : styles.user}`}>
                          {user.role === 'ADMIN' ? '관리자' : '사용자'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => openUserModal(user)}>
                            <Icons.Edit />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.email === 'admin@ct123.kr'}
                          >
                            <Icons.Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 사용자 관리 모달 */}
      {showUserModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? '사용자 수정' : '새 사용자 추가'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowUserModal(false)}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>이름 *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="사용자 이름"
                />
              </div>

              <div className={styles.formGroup}>
                <label>이메일 *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="user@example.com"
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div className={styles.formGroup}>
                  <label>비밀번호 *</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="최소 6자 이상"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>권한 *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'USER' | 'ADMIN' })}
                >
                  <option value="USER">사용자</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  setShowUserModal(false)
                  setEditingUser(null)
                  setUserForm({ email: '', password: '', name: '', role: 'USER' })
                }}
              >
                취소
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleUserSave}
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  )
}