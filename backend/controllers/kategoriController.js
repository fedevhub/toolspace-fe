const mongoose = require('mongoose')
const { randomUUID } = require('node:crypto')
const Kategori = require('../models/kategoriModel')
const Counter = require('../models/counterModels')

function serializeKategori(kategori) {
    return {
        id: kategori._id.toString(),
        kode_kategori: kategori.kode_kategori,
        nama_kategori: kategori.nama_kategori,
        deskripsi: kategori.deskripsi,
    }
}

function validateKategoriData(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Data kategori tidak valid.' }
    }

    if (typeof body.nama_kategori !== 'string' || !body.nama_kategori.trim()) {
        return { error: 'nama_kategori wajib diisi.' }
    }
    if (body.nama_kategori.trim().length > 120) {
        return { error: 'Nama kategori maksimal 120 karakter.' }
    }
    if (body.deskripsi !== undefined && typeof body.deskripsi !== 'string') {
        return { error: 'Deskripsi harus berupa teks.' }
    }

    return {
        data: {
            nama_kategori: body.nama_kategori.trim(),
            deskripsi: body.deskripsi?.trim() ?? '',
        },
    }
}

async function reserveKodeKategori() {
    const prefix = 'KK'
    const existingKategori = await Kategori.find({
        kode_kategori: new RegExp(`^${prefix}-(\\d+)$`),
    }).select('kode_kategori').lean()
    const highestExistingSequence = existingKategori.reduce((highest, kategori) => {
        const sequence = Number(kategori.kode_kategori.slice(prefix.length + 1))
        return Number.isSafeInteger(sequence) ? Math.max(highest, sequence) : highest
    }, 0)
    const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000)

    for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
            await Counter.updateOne(
                { _id: prefix },
                {
                    $max: { sequence: highestExistingSequence },
                    $pull: { reservations: { createdAt: { $lt: cleanupBefore } } },
                },
                { upsert: true }
            )
        } catch (error) {
            if (error.code === 11000) continue
            throw error
        }

        const counter = await Counter.findByIdAndUpdate(
            prefix,
            { $inc: { sequence: 1 } },
            { new: true }
        )
        if (!counter) continue

        const kodeKategori = `${prefix}-${String(counter.sequence).padStart(3, '0')}`
        const token = randomUUID()
        await Counter.updateOne(
            { _id: prefix },
            { $push: { reservations: { kode_kategori: kodeKategori, token, createdAt: new Date() } } }
        )
        return { kode_kategori: kodeKategori, token }
    }

    throw new Error('Tidak dapat mencadangkan ID kategori baru.')
}

function handleKategoriError(error, res, action) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'ID kategori tersebut sudah digunakan.' })
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Data kategori tidak valid.',
            errors: Object.fromEntries(
                Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]])
            ),
        })
    }

    console.error(`Gagal ${action}:`, error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
}

const kategoriController = {
    reserveCode: async (_req, res) => {
        try {
            return res.json(await reserveKodeKategori())
        } catch (error) {
            return handleKategoriError(error, res, 'membuat ID kategori')
        }
    },

    list: async (_req, res) => {
        try {
            const kategori = await Kategori.find().sort({ createdAt: -1 })
            return res.json(kategori.map(serializeKategori))
        } catch (error) {
            return handleKategoriError(error, res, 'mengambil data kategori')
        }
    },

    detail: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID kategori tidak valid.' })
        }

        try {
            const kategori = await Kategori.findById(req.params.id)
            if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan.' })
            return res.json(serializeKategori(kategori))
        } catch (error) {
            return handleKategoriError(error, res, 'mengambil detail kategori')
        }
    },

    create: async (req, res) => {
        const { data, error } = validateKategoriData(req.body)
        if (error) return res.status(400).json({ message: error })

        const { kode_kategori: kodeKategori, reservation_token: reservationToken } = req.body
        if (
            typeof kodeKategori !== 'string' ||
            !/^KK-\d{3,}$/.test(kodeKategori) ||
            typeof reservationToken !== 'string'
        ) {
            return res.status(400).json({ message: 'Kode kategori belum dicadangkan dengan benar.' })
        }

        try {
            const reservation = await Counter.findOneAndUpdate(
                {
                    _id: 'KK',
                    reservations: {
                        $elemMatch: {
                            kode_kategori: kodeKategori,
                            token: reservationToken,
                            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                        },
                    },
                },
                { $pull: { reservations: { kode_kategori: kodeKategori, token: reservationToken } } },
                { new: true }
            )
            if (!reservation) {
                return res.status(409).json({
                    message: 'Kode kategori sudah kedaluwarsa atau sudah digunakan. Muat ulang form untuk kode baru.',
                })
            }

            const kategori = await Kategori.create({
                ...data,
                kode_kategori: kodeKategori,
            })
            return res.status(201).json({
                message: 'Kategori berhasil ditambahkan.',
                data: serializeKategori(kategori),
            })
        } catch (error) {
            return handleKategoriError(error, res, 'menambahkan kategori')
        }
    },

    update: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID kategori tidak valid.' })
        }

        const { data, error } = validateKategoriData(req.body)
        if (error) return res.status(400).json({ message: error })

        try {
            const kategori = await Kategori.findById(req.params.id)
            if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan.' })

            kategori.nama_kategori = data.nama_kategori
            kategori.deskripsi = data.deskripsi
            await kategori.save()

            return res.json({
                message: 'Kategori berhasil diperbarui.',
                data: serializeKategori(kategori),
            })
        } catch (error) {
            return handleKategoriError(error, res, 'memperbarui kategori')
        }
    },

    remove: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID kategori tidak valid.' })
        }

        try {
            const kategori = await Kategori.findByIdAndDelete(req.params.id)
            if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan.' })
            return res.json({ message: 'Kategori berhasil dihapus.' })
        } catch (error) {
            return handleKategoriError(error, res, 'menghapus kategori')
        }
    },
}

module.exports = kategoriController
