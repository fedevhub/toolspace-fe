import api from "@/lib/api";

// Admin
export const getPengembalian = () => api.get("/pengembalian");
export const tambahPengembalian = (data) => api.post("/pengembalian", data);
export const editPengembalian = (id, data) =>
  api.put(`/pengembalian/${id}`, data);
export const hapusPengembalian = (id) => api.delete(`/pengembalian/${id}`);

// Petugas
export const getMonitorPengembalian = () => api.get("/pengembalian/monitor");
export const setujuiPengembalian = (peminjamanId, data) =>
  api.post(`/pengembalian/petugas/${peminjamanId}/setujui`, data);
export const tolakPengembalian = (peminjamanId) =>
  api.post(`/pengembalian/petugas/${peminjamanId}/tolak`);

// Peminjam
export const getPengembalianSaya = () => api.get("/pengembalian/milik-saya");
export const ajukanPengembalian = (peminjamanId) =>
  api.post("/pengembalian/ajukan", { peminjaman_id: peminjamanId });
