class ApiService {
  private baseURL = ''
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    })

    if (response.status === 401) {
      this.clearToken()
      // Don't redirect, just throw error
      throw new Error('Unauthorized')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API Error')
    }

    return data
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    this.setToken(data.token)
    return data
  }

  async register(email: string, password: string, name?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    })
  }

  // Company endpoints
  async getCompanies() {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        return response.json()
      }
      return []
    } catch (error) {
      console.error('Error loading companies:', error)
      return []
    }
  }

  async createCompany(data: { name: string; nameKr?: string; description?: string }) {
    return this.request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Main data endpoints
  async getMainData(companyId?: string) {
    const params = companyId ? `?companyId=${companyId}` : ''
    return this.request(`/api/main-data${params}`)
  }

  async createMainData(data: any) {
    return this.request('/api/main-data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Analysis data endpoints
  async getAnalysisData(companyId?: string, date?: string) {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    if (date) params.append('date', date)
    const queryString = params.toString()
    return this.request(`/api/analysis-data${queryString ? `?${queryString}` : ''}`)
  }

  async createAnalysisData(data: any) {
    return this.request('/api/analysis-data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Main data and analysis data methods
  async getSamsungMain(companyId?: string) {
    if (!companyId) {
      console.warn('No companyId provided for getSamsungMain')
      return []
    }
    return this.getMainData(companyId)
  }

  async getSamsungAnalysis(companyId?: string) {
    if (!companyId) {
      console.warn('No companyId provided for getSamsungAnalysis')
      return []
    }
    return this.getAnalysisData(companyId)
  }

  async analyze(data: any) {
    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export default new ApiService()