import api from '@/lib/api'

export const getPengguna = () => api.get('/pengguna')

export const tambahPengguna = (data) => api.post('/pengguna', data)

export const editPengguna = (id, data) => api.put(`/pengguna/${id}`, data)

export const hapusPengguna = (id) => api.delete(`/pengguna/${id}`)