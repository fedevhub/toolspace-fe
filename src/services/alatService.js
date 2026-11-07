import api from '@/lib/api'

export const getAlat = () => api.get('/alat')
export const reserveKodeAlat = () => api.post('/alat/reserve-code')
export const detailAlat = (id) => api.get(`/alat/${id}`)
export const tambahAlat = (data) => api.post('/alat', data)
export const editAlat = (id, data) => api.put(`/alat/${id}`, data)
export const hapusAlat = (id) => api.delete(`/alat/${id}`)
