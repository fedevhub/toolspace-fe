const User = require('../models/userModels')
const Alat = require('../models/alatModels')
const Peminjaman = require('../models/peminjamanModels')
const Pengembalian = require('../models/pengembalianModels')
function formatDate(value) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(value) }
module.exports = {
    summary: async (_req, res) => {
        try {
            const [users, alat, peminjaman, pengembalian] = await Promise.all([User.countDocuments(), Alat.countDocuments(), Peminjaman.countDocuments(), Pengembalian.countDocuments()])
            return res.json({ users, alat, peminjaman, pengembalian })
        } catch (error) { console.error('Gagal mengambil ringkasan:', error); return res.status(500).json({ message: 'Terjadi kesalahan pada server.' }) }
    },
    activity: async (_req, res) => {
        try {
            const [loans, returns] = await Promise.all([Peminjaman.find().sort({ createdAt: -1 }).limit(50), Pengembalian.find().sort({ createdAt: -1 }).limit(50)])
            const activity = [...loans.map((item) => ({ id: item._id.toString(), pengguna: item.nama_peminjam, aktivitas: `Mengajukan peminjaman ${item.nama_alat}`, waktu: formatDate(item.createdAt), createdAt: item.createdAt })), ...returns.map((item) => ({ id: item._id.toString(), pengguna: item.nama_peminjam, aktivitas: `Mengembalikan ${item.nama_alat}`, waktu: formatDate(item.createdAt), createdAt: item.createdAt }))].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100)
            return res.json(activity)
        } catch (error) { console.error('Gagal mengambil riwayat:', error); return res.status(500).json({ message: 'Terjadi kesalahan pada server.' }) }
    },
}
