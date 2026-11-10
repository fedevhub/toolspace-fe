import api from '@/lib/api'

export const getDashboardSummary = () => api.get('/dashboard/summary')
export const getRiwayatAktivitas = () => api.get('/dashboard/activity')
