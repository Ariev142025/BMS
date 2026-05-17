import axios from 'axios'
import { getCookie } from 'cookies-next'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use(cfg => {
  const token = getCookie('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      document.cookie = 'access_token=; Max-Age=0'
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (current_password: string, new_password: string) =>
    api.put('/auth/change-password', { current_password, new_password }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
}

// ── BUILDINGS ────────────────────────────────────────────────
export const buildingsApi = {
  get: (id: string) => api.get(`/buildings/${id}`),
  list: () => api.get('/buildings'),
  create: (data: any) => api.post('/buildings', data),
  update: (id: string, data: any) => api.put(`/buildings/${id}`, data),
}

// ── USERS ────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  shifts: {
    list: (params?: any) => api.get('/shifts', { params }),
    create: (data: any) => api.post('/shifts', data),
    assign: (data: any) => api.post('/shifts/assign', data),
    assignments: (params?: any) => api.get('/shifts/assignments', { params }),
  },
}

// ── ASSETS ───────────────────────────────────────────────────
export const assetsApi = {
  list: (params?: any) => api.get('/assets', { params }),
  categories: (building_id?: string) => api.get('/assets/categories', { params: { building_id } }),
  create: (data: any) => api.post('/assets', data),
  get: (id: string) => api.get(`/assets/${id}`),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
}

// ── TEMPLATES ────────────────────────────────────────────────
export const templatesApi = {
  list: (params?: any) => api.get('/templates', { params }),
  create: (data: any) => api.post('/templates', data),
  get: (id: string) => api.get(`/templates/${id}`),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  duplicate: (id: string) => api.post(`/templates/${id}/duplicate`),
  delete: (id: string) => api.delete(`/templates/${id}`),
}

// ── SCHEDULES ────────────────────────────────────────────────
export const schedulesApi = {
  list: (params?: any) => api.get('/schedules', { params }),
  create: (data: any) => api.post('/schedules', data),
  toggle: (id: string) => api.put(`/schedules/${id}/toggle`),
  delete: (id: string) => api.delete(`/schedules/${id}`),
}

// ── TASKS ────────────────────────────────────────────────────
export const tasksApi = {
  myTasks: (params?: any) => api.get('/tasks/my-tasks', { params }),
  buildingTasks: (params?: any) => api.get('/tasks/building-tasks', { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  start: (id: string) => api.put(`/tasks/${id}/start`),
  complete: (id: string, data: any) => api.put(`/tasks/${id}/complete`, data),
}

// ── WORK ORDERS ──────────────────────────────────────────────
export const workOrdersApi = {
  list: (params?: any) => api.get('/work-orders', { params }),
  myWO: (params?: any) => api.get('/work-orders/my-wo', { params }),
  create: (data: any) => api.post('/work-orders', data),
  get: (id: string) => api.get(`/work-orders/${id}`),
  update: (id: string, data: any) => api.put(`/work-orders/${id}`, data),
  approve: (id: string, approved: boolean, notes?: string) =>
    api.put(`/work-orders/${id}/approve`, null, { params: { approved, notes } }),
}

// ── MATERIALS ────────────────────────────────────────────────
export const materialsApi = {
  list: (params?: any) => api.get('/materials', { params }),
  create: (data: any) => api.post('/materials', data),
  transaction: (data: any) => api.post('/materials/transactions', data),
  requests: {
    list: (params?: any) => api.get('/materials/requests', { params }),
    create: (data: any) => api.post('/materials/requests', data),
    approve: (id: string, approved: boolean, notes?: string) =>
      api.put(`/materials/requests/${id}/approve`, null, { params: { approved, notes } }),
  },
}

// ── BILLING ──────────────────────────────────────────────────
export const billingApi = {
  meters: {
    list: (params?: any) => api.get('/billing/meters', { params }),
    create: (data: any) => api.post('/billing/meters', data),
    readings: (meterId: string, params?: any) => api.get(`/billing/readings/${meterId}`, { params }),
    addReading: (data: any) => api.post('/billing/readings', data),
  },
  tariffs: {
    list: (params?: any) => api.get('/billing/tariffs', { params }),
    create: (data: any) => api.post('/billing/tariffs', data),
  },
  invoices: {
    list: (params?: any) => api.get('/billing/invoices', { params }),
    generate: (data: any) => api.post('/billing/invoices/generate', data),
    issue: (data: any) => api.post('/billing/invoices/issue', data),
  },
}

// ── ALARMS ───────────────────────────────────────────────────
export const alarmsApi = {
  list: (params?: any) => api.get('/alarms', { params }),
  create: (data: any) => api.post('/alarms', data),
  ack: (id: string) => api.put(`/alarms/${id}/ack`),
  resolve: (id: string) => api.put(`/alarms/${id}/resolve`),
}

// ── VISITORS ─────────────────────────────────────────────────
export const visitorsApi = {
  register: (data: any) => api.post('/visitors', data),
  active: (params?: any) => api.get('/visitors/active', { params }),
  history: (params?: any) => api.get('/visitors/history', { params }),
  checkout: (id: string) => api.put(`/visitors/${id}/checkout`),
  validateAccess: (device_id: string, qr_code_uuid: string) =>
    api.post('/visitors/validate-access', null, { params: { device_id, qr_code_uuid } }),
  parking: {
    validate: (eventId: string) => api.put(`/visitors/parking/${eventId}/validate`),
  },
}

// ── DASHBOARD ────────────────────────────────────────────────
export const dashboardApi = {
  adminStats: (building_id?: string) => api.get('/dashboard/admin/stats', { params: { building_id } }),
  myStats: () => api.get('/dashboard/my-stats'),
}

// ── UPLOAD ───────────────────────────────────────────────────
export const uploadApi = {
  upload: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const token = getCookie('access_token')
    const res = await axios.post(`${BASE}/upload`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data.url
  },
}

// ── SAAS / SUBSCRIPTION ──────────────────────────────────────
export const saasApi = {
  plans: () => api.get('/saas/plans'),
  register: (data: any) => api.post('/saas/register', data),
  subscription: () => api.get('/saas/subscription'),
  createPayment: (data: any) => api.post('/saas/payment/create', data),
  paymentStatus: (txnId: string) => api.get(`/saas/payment/${txnId}`),
  paymentHistory: () => api.get('/saas/payment-history'),
}

// ── SUPER ADMIN ───────────────────────────────────────────────
export const superAdminApi = {
  stats: () => api.get('/superadmin/stats'),
  companies: (params?: any) => api.get('/superadmin/companies', { params }),
  getCompany: (id: string) => api.get(`/superadmin/companies/${id}`),
  updateSubscription: (id: string, data: any) => api.put(`/superadmin/companies/${id}/subscription`, data),
  toggleCompany: (id: string) => api.put(`/superadmin/companies/${id}/toggle`),
}

// ── WEBSOCKET ────────────────────────────────────────────────
export function createWsConnection(buildingId: string, token: string): WebSocket | null {
  if (typeof window === 'undefined') return null
  const wsBase = BASE.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api/v1', '')
  return new WebSocket(`${wsBase}/ws/${buildingId}?token=${token}`)
}
