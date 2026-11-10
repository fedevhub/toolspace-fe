import api from '@/lib/api'

export const getPeminjaman = () => api.get('/peminjaman')
export const detailPeminjaman = (id) => api.get(`/peminjaman/${id}`)
export const tambahPeminjaman = (data) => api.post('/peminjaman', data)
export const editPeminjaman = (id, data) => api.put(`/peminjaman/${id}`, data)
export const hapusPeminjaman = (id) => api.delete(`/peminjaman/${id}`)
export const ubahStatusPeminjaman = (id, status) =>
    api.patch(`/peminjaman/${id}/status`, { status })
