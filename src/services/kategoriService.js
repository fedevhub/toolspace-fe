import api from '@/lib/api'

export const getKategori = () => api.get("/kategori");
export const detailKategori = (id) => api.get(`/kategori/${id}`);
export const reserveKodeKategori = () => api.post("/kategori/reserve-code");
export const tambahKategori = (data) => api.post("/kategori", data);
export const editKategori = (id, data) => api.put(`/kategori/${id}`, data);
export const hapusKategori = (id) => api.delete(`/kategori/${id}`);