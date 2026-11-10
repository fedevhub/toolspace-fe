const mongoose = require('mongoose')
const Peminjaman = require('../models/peminjamanModels')
const User = require('../models/userModels')
const Alat = require('../models/alatModels')
const Counter = require('../models/counterModels')

const statuses = ['Disetujui', 'Ditolak']

function parseTanggal(value) {
    if (typeof value !== 'string') return null

    const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    if (dmyMatch) {
        const [, day, month, year] = dmyMatch
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
        if (
            date.getUTCDate() === Number(day) &&
            date.getUTCMonth() === Number(month) - 1 &&
            date.getUTCFullYear() === Number(year)
        ) {
            return `${year}-${month}-${day}`
        }
        return null
    }

    const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value)
    if (!isoMatch) return null
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
        ? value
        : null
}

function formatTanggal(value) {
    const iso = parseTanggal(value)
    if (!iso) return value
    const [year, month, day] = iso.split('-')
    return `${day}-${month}-${year}`
}

function serializePeminjaman(peminjaman) {
    return {
        id: peminjaman._id.toString(),
        kode_peminjaman: peminjaman.kode_peminjaman,
        pengguna_id: peminjaman.pengguna_id.toString(),
        nama_peminjam: peminjaman.nama_peminjam,
        alat_id: peminjaman.alat_id.toString(),
        alat: peminjaman.nama_alat,
        kategori_alat: peminjaman.kategori_alat ?? '',
        jumlah: peminjaman.jumlah,
        keperluan: peminjaman.keperluan,
        tanggal_pinjam: formatTanggal(peminjaman.tanggal_pinjam),
        tanggal_kembali: formatTanggal(peminjaman.tanggal_kembali),
        status: peminjaman.status,
    }
}

function validatePeminjamanData(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Data peminjaman tidak valid.' }
    }

    if (!mongoose.isValidObjectId(body.pengguna_id)) {
        return { error: 'Peminjam tidak valid.' }
    }
    if (!mongoose.isValidObjectId(body.alat_id)) {
        return { error: 'Alat tidak valid.' }
    }
    const tanggalPinjam = parseTanggal(body.tanggal_pinjam)
    const tanggalKembali = parseTanggal(body.tanggal_kembali)
    if (!tanggalPinjam || !tanggalKembali) {
        return { error: 'Tanggal pinjam dan kembali wajib menggunakan format DD/MM/YYYY yang valid.' }
    }
    if (tanggalKembali < tanggalPinjam) {
        return { error: 'Tanggal kembali tidak boleh sebelum tanggal pinjam.' }
    }
    if (typeof body.keperluan !== 'string' || !body.keperluan.trim()) {
        return { error: 'Keperluan wajib diisi.' }
    }
    if (body.keperluan.trim().length > 500) {
        return { error: 'Keperluan maksimal 500 karakter.' }
    }
    const jumlah = typeof body.jumlah === 'string' && body.jumlah.trim()
        ? Number(body.jumlah)
        : body.jumlah
    if (!Number.isSafeInteger(jumlah) || jumlah < 1) {
        return { error: 'Jumlah harus berupa bilangan bulat minimal 1.' }
    }

    return {
        data: {
            pengguna_id: body.pengguna_id,
            alat_id: body.alat_id,
            tanggal_pinjam: formatTanggal(body.tanggal_pinjam),
            tanggal_kembali: formatTanggal(body.tanggal_kembali),
            keperluan: body.keperluan.trim(),
            jumlah,
        },
    }
}

async function generateKodePeminjaman() {
    const prefix = 'PM'
    for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
            await Counter.updateOne({ _id: prefix }, { $setOnInsert: { sequence: 0 } }, { upsert: true })
            const counter = await Counter.findByIdAndUpdate(
                prefix,
                { $inc: { sequence: 1 } },
                { new: true }
            )
            if (counter) return `${prefix}-${String(counter.sequence).padStart(3, '0')}`
        } catch (error) {
            if (error.code !== 11000) throw error
        }
    }
    throw new Error('Tidak dapat membuat kode peminjaman baru.')
}

function handlePeminjamanError(error, res, action) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Kode peminjaman tersebut sudah digunakan.' })
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Data peminjaman tidak valid.',
            errors: Object.fromEntries(
                Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]])
            ),
        })
    }
    console.error(`Gagal ${action}:`, error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
}

const peminjamanController = {
    list: async (req, res) => {
        try {
            const filter = req.user.role === 'peminjam'
                ? { pengguna_id: req.user.id }
                : {}
            const peminjaman = await Peminjaman.find(filter).sort({ createdAt: -1 })
            return res.json(peminjaman.map(serializePeminjaman))
        } catch (error) {
            return handlePeminjamanError(error, res, 'mengambil data peminjaman')
        }
    },

    detail: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }

        try {
            const peminjaman = await Peminjaman.findById(req.params.id)
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            return res.json(serializePeminjaman(peminjaman))
        } catch (error) {
            return handlePeminjamanError(error, res, 'mengambil detail peminjaman')
        }
    },

    create: async (req, res) => {
        const requestData = req.user.role === 'peminjam'
            ? { ...req.body, pengguna_id: req.user.id }
            : req.body
        const { data, error } = validatePeminjamanData(requestData)
        if (error) return res.status(400).json({ message: error })

        try {
            const [pengguna, alat] = await Promise.all([
                User.findOne({ _id: data.pengguna_id, role: 'peminjam', status_aktif: true }),
                Alat.findById(data.alat_id),
            ])
            if (!pengguna) {
                return res.status(400).json({ message: 'Pilih pengguna aktif dengan role peminjam.' })
            }
            if (!alat || alat.status_aktif === false) {
                return res.status(400).json({ message: 'Alat tidak tersedia untuk dipinjam.' })
            }
            if (data.jumlah > alat.tersedia) {
                return res.status(400).json({ message: `Jumlah alat yang tersedia hanya ${alat.tersedia}.` })
            }

            const peminjaman = await Peminjaman.create({
                ...data,
                kode_peminjaman: await generateKodePeminjaman(),
                nama_peminjam: pengguna.nama_lengkap,
                nama_alat: alat.nama_alat,
                kategori_alat: alat.kategori,
                status: 'Menunggu',
            })
            return res.status(201).json({
                message: 'Peminjaman berhasil diajukan dan menunggu persetujuan petugas.',
                data: serializePeminjaman(peminjaman),
            })
        } catch (createError) {
            return handlePeminjamanError(createError, res, 'membuat peminjaman')
        }
    },

    update: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }
        const { data, error } = validatePeminjamanData(req.body)
        if (error) return res.status(400).json({ message: error })

        try {
            const [peminjaman, pengguna, alat] = await Promise.all([
                Peminjaman.findById(req.params.id),
                User.findOne({ _id: data.pengguna_id, role: 'peminjam', status_aktif: true }),
                Alat.findById(data.alat_id),
            ])
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            if (!pengguna) return res.status(400).json({ message: 'Pilih pengguna aktif dengan role peminjam.' })
            if (!alat || alat.status_aktif === false) {
                return res.status(400).json({ message: 'Alat tidak tersedia untuk dipinjam.' })
            }

            Object.assign(peminjaman, data, {
                nama_peminjam: pengguna.nama_lengkap,
                nama_alat: alat.nama_alat,
                kategori_alat: alat.kategori,
            })
            await peminjaman.save()
            return res.json({
                message: 'Peminjaman berhasil diperbarui.',
                data: serializePeminjaman(peminjaman),
            })
        } catch (error) {
            return handlePeminjamanError(error, res, 'memperbarui peminjaman')
        }
    },

    remove: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }

        try {
            const peminjaman = await Peminjaman.findByIdAndDelete(req.params.id)
            if (!peminjaman) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
            return res.json({ message: 'Peminjaman berhasil dihapus.' })
        } catch (error) {
            return handlePeminjamanError(error, res, 'menghapus peminjaman')
        }
    },

    updateStatus: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID peminjaman tidak valid.' })
        }
        if (!req.body || !statuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Status peminjaman harus Disetujui atau Ditolak.' })
        }

        try {
            const peminjaman = await Peminjaman.findOneAndUpdate(
                { _id: req.params.id, status: 'Menunggu' },
                { $set: { status: req.body.status } },
                { new: true, runValidators: true }
            )
            if (!peminjaman) {
                const existing = await Peminjaman.findById(req.params.id).select('_id status')
                if (!existing) return res.status(404).json({ message: 'Peminjaman tidak ditemukan.' })
                return res.status(409).json({ message: 'Hanya peminjaman berstatus Menunggu yang dapat diubah.' })
            }
            return res.json({
                message: `Peminjaman berhasil ${req.body.status === 'Disetujui' ? 'disetujui' : 'ditolak'}.`,
                data: serializePeminjaman(peminjaman),
            })
        } catch (error) {
            return handlePeminjamanError(error, res, 'mengubah status peminjaman')
        }
    },
}

module.exports = peminjamanController
