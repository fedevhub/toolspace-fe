import api from '@/lib/api'

export const getPengembalian = () => api.get('/pengembalian')
export const tambahPengembalian = (data) => api.post('/pengembalian', data)
export const hapusPengembalian = (id) => api.delete(`/pengembalian/${id}`)
