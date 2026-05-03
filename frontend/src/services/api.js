import axios from 'axios'

const api = axios.create({ baseURL: '' })

// Attach token to every request automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Auth ──────────────────────────────────────────────────────
export const signup = (data) =>
  api.post('/auth/signup', data).then(r => r.data)

export const login = (data) =>
  api.post('/auth/login', data).then(r => r.data)

// ── Applications ──────────────────────────────────────────────
export const predict = (data) =>
  api.post('/predict', data).then(r => r.data)

export const getMyApplications = () =>
  api.get('/my-applications').then(r => r.data)

// Admin only
export const getAllApplications = (params = {}) =>
  api.get('/applications', { params }).then(r => r.data)

export const getApplication = (id) =>
  api.get(`/applications/${id}`).then(r => r.data)

export const overrideDecision = (id, decision) =>
  api.patch(`/applications/${id}/override`, { decision }).then(r => r.data)
