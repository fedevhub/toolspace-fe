import api from '@/lib/api'

export const getPengguna = () => api.get('/users')

export const tambahPengguna = (data) => api.post('/users', data)

export const editPengguna = (id, data) =>
    api.put(`/users/${id}`, data)

export const hapusPengguna = (id) =>
    api.delete(`/users/${id}`)

export const detailPengguna = (id) => api.get(`/users/${id}`);
