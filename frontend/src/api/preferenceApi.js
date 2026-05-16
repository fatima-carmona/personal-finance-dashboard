import api from './axiosConfig'

export const getPreferences = () => api.get('/preferences').then(r => r.data)
export const updatePreferences = (payload) => api.put('/preferences', payload).then(r => r.data)
