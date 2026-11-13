const mongoose = require('mongoose')
const Pengembalian = require('../models/pengembalianModels')
const Peminjaman = require('../models/peminjamanModels')
const Alat = require('../models/alatModels')
const Counter = require('../models/counterModels')

const KONDISI = ['Baik', 'Rusak Ringan', 'Rusak Berat']

// Menerima DD-MM-YYYY, DD/MM/YYYY, atau YYYY-MM-DD. Hasil selalu YYYY-MM-DD.
function parseTanggal(value) {
    if (typeof value !== 'string') return null
    const text = value.trim()
    let y, m, d
    let match = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(text)
    if (match) {
        [, d, m, y] = match
    } else {
        match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
        if (!match) return null
        [ y, m, d] = match
    }
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
    if (
        date.getUTCFullYear() !== Number(y) ||
        date.getUTCMonth() !== Number(m) - 1 ||
        date.getUTCDate() !== Number(d)
    ) return null
    return `${y}-${m}-${d}`
}

function formatTanggal(value) {
    const iso = parseTanggal(value)
    return iso ? `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}` : value
}

function hariIni() {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function selisihHari(dari, sampai) {
    return Math.round((Date.parse(`${sampai}T00:00:00Z`) - Date.parse(`${dari}T00:00:00Z`)) / 86400000)
}

function serialize(item) {
    return {
        id: item._id.toString(),
        kode_pengembalian: item.kode_pengembalian,
        peminjaman_id: item.peminjaman_id.toString(),
        pengguna_id: item.pengguna_id.toString(),
        alat_id: item.alat_id.toString(),
        nama_peminjam: item.nama_peminjam,
        alat: item.nama_alat,
        jumlah: item.jumlah,
        tanggal_pengembalian: formatTanggal(item.tanggal_pengembalian),
        kondisi: item.kondisi,
        denda: item.denda,
        status: item.status,
        keterangan: item.keterangan,
    }
}

async function generateKode() {
    const counter = await Counter.findByIdAndUpdate(
        'PK',
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    return `PK-${String(counter.sequence).padStart(3, '0')}`
}

function tambahStok(alatId, jumlah) {
    return Alat.updateOne({ _id: alatId }, [
        { $set: { tersedia: { $min: ['$jumlah', { $add: ['$tersedia', jumlah] }] } } },
    ])
}

function validasiPenilaian(body) {
    if (!body || !KONDISI.includes(body.kondisi)) return { error: 'Kondisi alat tidak valid.' }
    const denda = body.denda === '' || body.denda === undefined || body.denda === null ? 0 : Number(body.denda)
    if (!Number.isFinite(denda) || denda < 0) return { error: 'Denda harus bernilai nol atau lebih.' }
    if (body.keterangan !== undefined && (typeof body.keterangan !== 'string' || body.keterangan.length > 500)) {
        return { error: 'Keterangan tidak valid.' }
    }
    return { data: { kondisi: body.kondisi, denda, keterangan: body.keterangan?.trim() ?? '' } }
}

function handle(error, res, action) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Peminjaman tersebut sudah memiliki data pengembalian.' })
    }
    console.error(`Gagal ${action}:`, error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
}

function buatBaris(peminjaman, record, tanggalHariIni) {
    const batas = parseTanggal(peminjaman.tanggal_kembali)
    const diajukan = record?.status === 'Menunggu'
    const sudahKembali = Boolean(record) && !diajukan
    const acuan = (record && parseTanggal(record.tanggal_pengembalian)) || tanggalHariIni
    const telat = batas ? Math.max(0, selisihHari(batas, acuan)) : 0

    let status
    if (diajukan) status = 'Menunggu'
    else if (telat > 0) status = 'Terlambat'
    else status = sudahKembali ? 'Selesai' : 'Dipinjam'

    return {
        id: peminjaman._id.toString(),
        kode_peminjaman: peminjaman.kode_peminjaman,
        pengembalian_id: record ? record._id.toString() : null,
        nama_peminjam: peminjaman.nama_peminjam,
        alat: peminjaman.nama_alat,
        alat_id: peminjaman.alat_id.toString(),
        jumlah: peminjaman.jumlah,
        tanggal_pinjam: formatTanggal(peminjaman.tanggal_pinjam),
        batas_kembali: formatTanggal(peminjaman.tanggal_kembali),
        tanggal_kembali: sudahKembali ? formatTanggal(record.tanggal_pengembalian) : null,
        tanggal_pengajuan: diajukan ? formatTanggal(record.tanggal_pengembalian) : null,
        keterlambatan: telat,
        kondisi: record?.kondisi ?? '',
        denda: sudahKembali ? record.denda : 0,
        status,
        sudah_kembali: sudahKembali,
        diajukan,
    }
}

module.exports = {
    // ===== Admin =====
    list: async (_req, res) => {
        try {
            const data = await Pengembalian.find().sort({ createdAt: -1 })
            return res.json(data.map(serialize))
        } catch (error) {
            return handle(error, res, 'mengambil pengembalian')
        }
    },

    create: async (req, res) => {
        const body = req.body
        if (!body || !mongoose.isValidObjectId(body.peminjaman_id)) {
            return res.status(400).json({ message: 'Peminjaman tidak valid.' })
        }
        const tanggal = parseTanggal(body.tanggal_pengembalian)
        if (!tanggal) {
            return res.status(400).json({ message: 'Tanggal pengembalian tidak valid.' })
        }
        const { data, error } = validasiPenilaian(body)
        if (error) return res.status(400).json({ message: error })

        try {
            const peminjaman = await Peminjaman.findById(body.peminjaman_id)
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            if (peminjaman.status !== 'Disetujui') {
                return res.status(400).json({ message: 'Hanya peminjaman yang telah disetujui yang dapat dikembalikan.' })
            }
            const pinjam = parseTanggal(peminjaman.tanggal_pinjam)
            if (pinjam && tanggal < pinjam) {
                return res.status(400).json({ message: 'Tanggal pengembalian tidak boleh sebelum tanggal pinjam.' })
            }
            const alat = await Alat.findById(peminjaman.alat_id)
            if (!alat) return res.status(400).json({ message: 'Alat pada peminjaman sudah tidak ditemukan.' })

            const item = await Pengembalian.create({
                ...data,
                tanggal_pengembalian: tanggal,
                kode_pengembalian: await generateKode(),
                peminjaman_id: peminjaman._id,
                pengguna_id: peminjaman.pengguna_id,
                alat_id: peminjaman.alat_id,
                nama_peminjam: peminjaman.nama_peminjam,
                nama_alat: peminjaman.nama_alat,
                jumlah: peminjaman.jumlah,
                status: data.denda > 0 ? 'Denda' : 'Selesai',
            })
            await tambahStok(alat._id, peminjaman.jumlah)
            return res.status(201).json({ message: 'Pengembalian berhasil dicatat.', data: serialize(item) })
        } catch (error) {
            return handle(error, res, 'mencatat pengembalian')
        }
    },

    remove: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID pengembalian tidak valid.' })
        }
        try {
            const item = await Pengembalian.findByIdAndDelete(req.params.id)
            if (!item) return res.status(404).json({ message: 'Pengembalian tidak ditemukan.' })
            if (item.status !== 'Menunggu') {
                await Alat.updateOne({ _id: item.alat_id }, [
                    { $set: { tersedia: { $max: [0, { $subtract: ['$tersedia', item.jumlah] }] } } },
                ])
            }
            return res.json({ message: 'Pengembalian berhasil dihapus.' })
        } catch (error) {
            return handle(error, res, 'menghapus pengembalian')
        }
    },

    // ===== Petugas =====
    monitor: async (_req, res) => {
        try {
            const daftar = await Peminjaman.find({ status: 'Disetujui' }).sort({ createdAt: -1 })
            const records = await Pengembalian.find({ peminjaman_id: { $in: daftar.map((item) => item._id) } })
            const peta = new Map(records.map((item) => [item.peminjaman_id.toString(), item]))
            const tanggalHariIni = hariIni()
            return res.json(daftar.map((item) => buatBaris(item, peta.get(item._id.toString()), tanggalHariIni)))
        } catch (error) {
            return handle(error, res, 'mengambil data pengembalian')
        }
    },

    setujui: async (req, res) => {
        const { peminjamanId } = req.params
        if (!mongoose.isValidObjectId(peminjamanId)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }
        const { data, error } = validasiPenilaian(req.body)
        if (error) return res.status(400).json({ message: error })

        try {
            const peminjaman = await Peminjaman.findById(peminjamanId)
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            if (peminjaman.status !== 'Disetujui') {
                return res.status(400).json({ message: 'Hanya peminjaman yang disetujui yang dapat dikembalikan.' })
            }

            const status = data.denda > 0 ? 'Denda' : 'Selesai'

            // Jika peminjam sudah mengajukan (Menunggu), finalkan pengajuan itu
            let item = await Pengembalian.findOneAndUpdate(
                { peminjaman_id: peminjaman._id, status: 'Menunggu' },
                { $set: { kondisi: data.kondisi, denda: data.denda, status, keterangan: data.keterangan } },
                { new: true, runValidators: true }
            )

            // Jika belum ada pengajuan, petugas mencatat pengembalian langsung
            if (!item) {
                item = await Pengembalian.create({
                    kode_pengembalian: await generateKode(),
                    peminjaman_id: peminjaman._id,
                    pengguna_id: peminjaman.pengguna_id,
                    alat_id: peminjaman.alat_id,
                    nama_peminjam: peminjaman.nama_peminjam,
                    nama_alat: peminjaman.nama_alat,
                    jumlah: peminjaman.jumlah,
                    tanggal_pengembalian: hariIni(),
                    kondisi: data.kondisi,
                    denda: data.denda,
                    keterangan: data.keterangan,
                    status,
                })
            }

            await tambahStok(peminjaman.alat_id, peminjaman.jumlah)
            return res.json({ message: 'Pengembalian berhasil disetujui.', data: serialize(item) })
        } catch (error) {
            return handle(error, res, 'menyetujui pengembalian')
        }
    },

    tolak: async (req, res) => {
        const { peminjamanId } = req.params
        if (!mongoose.isValidObjectId(peminjamanId)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }
        try {
            const item = await Pengembalian.findOneAndDelete({ peminjaman_id: peminjamanId, status: 'Menunggu' })
            if (!item) {
                return res.status(400).json({ message: 'Tidak ada pengajuan pengembalian yang menunggu.' })
            }
            return res.json({ message: 'Pengajuan pengembalian ditolak.' })
        } catch (error) {
            return handle(error, res, 'menolak pengembalian')
        }
    },

    // ===== Peminjam =====
    milikSaya: async (req, res) => {
        try {
            const data = await Pengembalian.find({ pengguna_id: req.user.id }).sort({ createdAt: -1 })
            return res.json(data.map(serialize))
        } catch (error) {
            return handle(error, res, 'mengambil riwayat pengembalian')
        }
    },

    ajukan: async (req, res) => {
        if (!mongoose.isValidObjectId(req.body?.peminjaman_id)) {
            return res.status(400).json({ message: 'Peminjaman tidak valid.' })
        }
        try {
            const peminjaman = await Peminjaman.findOne({ _id: req.body.peminjaman_id, pengguna_id: req.user.id })
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            if (peminjaman.status !== 'Disetujui') {
                return res.status(400).json({ message: 'Hanya peminjaman yang disetujui yang dapat dikembalikan.' })
            }
            const item = await Pengembalian.create({
                kode_pengembalian: await generateKode(),
                peminjaman_id: peminjaman._id,
                pengguna_id: peminjaman.pengguna_id,
                alat_id: peminjaman.alat_id,
                nama_peminjam: peminjaman.nama_peminjam,
                nama_alat: peminjaman.nama_alat,
                jumlah: peminjaman.jumlah,
                tanggal_pengembalian: hariIni(),
                kondisi: 'Baik',
                denda: 0,
                status: 'Menunggu',
            })
            return res.status(201).json({ message: 'Pengembalian diajukan, menunggu petugas.', data: serialize(item) })
        } catch (error) {
            return handle(error, res, 'mengajukan pengembalian')
        }
    },
}
