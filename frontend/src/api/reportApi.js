import api from './axiosConfig'

export const getDashboardSummary = (params) => api.get('/reports/dashboard', { params }).then(r => r.data)
