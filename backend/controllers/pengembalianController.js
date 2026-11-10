const mongoose = require('mongoose')
const Pengembalian = require('../models/pengembalianModels')
const Peminjaman = require('../models/peminjamanModels')
const Alat = require('../models/alatModels')
const Counter = require('../models/counterModels')
const KONDISI = ['Baik', 'Rusak Ringan', 'Rusak Berat']

function parseTanggal(value) {
    if (typeof value !== 'string') return null
    const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    const normalized = dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
    if (!normalized) return null
    const date = new Date(`${normalized}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === normalized ? normalized : null
}
function formatTanggal(value) { const iso = parseTanggal(value); return iso ? `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}` : value }
function serialize(item) { return { id: item._id.toString(), kode_pengembalian: item.kode_pengembalian, peminjaman_id: item.peminjaman_id.toString(), pengguna_id: item.pengguna_id.toString(), alat_id: item.alat_id.toString(), nama_peminjam: item.nama_peminjam, alat: item.nama_alat, jumlah: item.jumlah, tanggal_pengembalian: formatTanggal(item.tanggal_pengembalian), kondisi: item.kondisi, denda: item.denda, status: item.status, keterangan: item.keterangan } }
async function generateKode() { const counter = await Counter.findByIdAndUpdate('PK', { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }); return `PK-${String(counter.sequence).padStart(3, '0')}` }
function validasi(body) {
    if (!body || !mongoose.isValidObjectId(body.peminjaman_id)) return { error: 'Peminjaman tidak valid.' }
    const tanggal = parseTanggal(body.tanggal_pengembalian)
    if (!tanggal) return { error: 'Tanggal pengembalian wajib menggunakan format DD/MM/YYYY yang valid.' }
    if (!KONDISI.includes(body.kondisi)) return { error: 'Kondisi alat tidak valid.' }
    const denda = body.denda === '' || body.denda === undefined ? 0 : Number(body.denda)
    if (!Number.isFinite(denda) || denda < 0) return { error: 'Denda harus bernilai nol atau lebih.' }
    if (body.keterangan !== undefined && (typeof body.keterangan !== 'string' || body.keterangan.length > 500)) return { error: 'Keterangan tidak valid.' }
    return { data: { tanggal_pengembalian: tanggal, kondisi: body.kondisi, denda, keterangan: body.keterangan?.trim() ?? '' } }
}
function handle(error, res, action) { if (error.code === 11000) return res.status(409).json({ message: 'Peminjaman tersebut sudah memiliki data pengembalian.' }); console.error(`Gagal ${action}:`, error); return res.status(500).json({ message: 'Terjadi kesalahan pada server.' }) }
module.exports = {
    list: async (_req, res) => { try { return res.json((await Pengembalian.find().sort({ createdAt: -1 })).map(serialize)) } catch (error) { return handle(error, res, 'mengambil pengembalian') } },
    create: async (req, res) => {
        const { data, error } = validasi(req.body); if (error) return res.status(400).json({ message: error })
        try {
            const peminjaman = await Peminjaman.findById(req.body.peminjaman_id)
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            if (peminjaman.status !== 'Disetujui') return res.status(400).json({ message: 'Hanya peminjaman yang telah disetujui yang dapat dikembalikan.' })
            if (data.tanggal_pengembalian < parseTanggal(peminjaman.tanggal_pinjam)) return res.status(400).json({ message: 'Tanggal pengembalian tidak boleh sebelum tanggal pinjam.' })
            const alat = await Alat.findById(peminjaman.alat_id); if (!alat) return res.status(400).json({ message: 'Alat pada peminjaman sudah tidak ditemukan.' })
            const item = await Pengembalian.create({ ...data, kode_pengembalian: await generateKode(), peminjaman_id: peminjaman._id, pengguna_id: peminjaman.pengguna_id, alat_id: peminjaman.alat_id, nama_peminjam: peminjaman.nama_peminjam, nama_alat: peminjaman.nama_alat, jumlah: peminjaman.jumlah, status: data.denda > 0 ? 'Denda' : 'Selesai' })
            await Alat.updateOne({ _id: alat._id }, { $set: { tersedia: Math.min(alat.jumlah, alat.tersedia + peminjaman.jumlah) } })
            return res.status(201).json({ message: 'Pengembalian berhasil dicatat.', data: serialize(item) })
        } catch (createError) { return handle(createError, res, 'mencatat pengembalian') }
    },
    remove: async (req, res) => { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID pengembalian tidak valid.' }); try { const item = await Pengembalian.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Pengembalian tidak ditemukan.' }); await Alat.updateOne({ _id: item.alat_id }, { $inc: { tersedia: -item.jumlah } }); return res.json({ message: 'Pengembalian berhasil dihapus.' }) } catch (error) { return handle(error, res, 'menghapus pengembalian') } },
}
