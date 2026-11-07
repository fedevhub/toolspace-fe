const mongoose = require('mongoose')
const { randomUUID } = require('node:crypto')
const Alat = require('../models/alatModels')
const Counter = require('../models/counterModels')

function serializeAlat(alat) {
    return {
        id: alat._id.toString(),
        kode_alat: alat.kode_alat,
        nama_alat: alat.nama_alat,
        kategori: alat.kategori,
        jumlah: alat.jumlah,
        tersedia: alat.tersedia,
        kondisi: alat.kondisi,
        status_aktif: alat.status_aktif !== false,
        status: alat.status_aktif === false
            ? 'Tidak Tersedia'
            : alat.tersedia > 0 ? 'Tersedia' : 'Habis',
        deskripsi: alat.deskripsi,
        gambar: alat.gambar,
    }
}

function validateAlatData(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Data alat tidak valid.' }
    }

    const data = {}
    for (const [field, maxLength] of [['nama_alat', 120], ['kategori', 80]]) {
        if (typeof body[field] !== 'string' || !body[field].trim()) {
            return { error: `${field} wajib diisi.` }
        }
        data[field] = body[field].trim()
        if (data[field].length > maxLength) {
            return { error: `${field} maksimal ${maxLength} karakter.` }
        }
    }

    const jumlah = typeof body.jumlah === 'string' && body.jumlah.trim()
        ? Number(body.jumlah)
        : body.jumlah
    if (!Number.isSafeInteger(jumlah) || jumlah < 0) {
        return { error: 'Jumlah harus berupa bilangan bulat nol atau lebih.' }
    }
    data.jumlah = jumlah

    if (!['Baik', 'Rusak Ringan', 'Rusak Berat'].includes(body.kondisi)) {
        return { error: 'Kondisi alat tidak valid.' }
    }
    data.kondisi = body.kondisi

    for (const field of ['deskripsi', 'gambar']) {
        if (body[field] !== undefined && typeof body[field] !== 'string') {
            return { error: `${field} harus berupa teks.` }
        }
        data[field] = body[field]?.trim() ?? ''
    }

    if (data.deskripsi.length > 2000 || data.gambar.length > 7_000_000) {
        return { error: 'Deskripsi atau foto terlalu besar.' }
    }

    if (data.gambar) {
        if (data.gambar.startsWith('data:')) {
            const imageMatch = data.gambar.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/)
            if (!imageMatch) {
                return { error: 'Foto harus berupa gambar PNG atau JPG yang valid.' }
            }
            const padding = imageMatch[2].endsWith('==') ? 2 : imageMatch[2].endsWith('=') ? 1 : 0
            const size = Math.floor(imageMatch[2].length * 3 / 4) - padding
            if (size > 5 * 1024 * 1024) {
                return { error: 'Ukuran foto maksimal 5 MB.' }
            }
            const imageBytes = Buffer.from(imageMatch[2], 'base64')
            const isPng = imageMatch[1] === 'png' &&
                imageBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            const isJpeg = imageMatch[1] === 'jpeg' &&
                imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff
            if (!isPng && !isJpeg) {
                return { error: 'Isi file foto bukan gambar PNG atau JPG yang valid.' }
            }
        } else {
            try {
                const imageUrl = new URL(data.gambar)
                if (!['http:', 'https:'].includes(imageUrl.protocol)) {
                    return { error: 'Foto harus berupa PNG atau JPG.' }
                }
            } catch {
                return { error: 'Foto harus berupa PNG atau JPG yang valid.' }
            }
        }
    }

    if (body.status_aktif !== undefined && typeof body.status_aktif !== 'boolean') {
        return { error: 'Status alat tidak valid.' }
    }
    if (body.status_aktif !== undefined) data.status_aktif = body.status_aktif

    return { data }
}

async function reserveKodeAlat(prefix) {
    const existingAlat = await Alat.find({
        kode_alat: new RegExp(`^${prefix}-(\\d+)$`),
    }).select('kode_alat').lean()
    const highestExistingSequence = existingAlat.reduce((highest, alat) => {
        const sequence = Number(alat.kode_alat.slice(prefix.length + 1))
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

        const kodeAlat = `${prefix}-${String(counter.sequence).padStart(3, '0')}`
        const token = randomUUID()
        await Counter.updateOne(
            { _id: prefix },
            { $push: { reservations: { kode_alat: kodeAlat, token, createdAt: new Date() } } }
        )
        return { kode_alat: kodeAlat, token }
    }

    throw new Error(`Tidak dapat mencadangkan ID alat baru untuk awalan ${prefix}.`)
}

function handleAlatError(error, res, action) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'ID alat tersebut sudah digunakan.' })
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Data alat tidak valid.',
            errors: Object.fromEntries(
                Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]])
            ),
        })
    }

    console.error(`Gagal ${action}:`, error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
}

const alatController = {
    reserveCode: async (_req, res) => {
        try {
            return res.json(await reserveKodeAlat('KA'))
        } catch (error) {
            return handleAlatError(error, res, 'membuat ID alat')
        }
    },

    list: async (_req, res) => {
        try {
            const alat = await Alat.find().select('-gambar').sort({ createdAt: -1 })
            return res.json(alat.map(serializeAlat))
        } catch (error) {
            return handleAlatError(error, res, 'mengambil data alat')
        }
    },

    detail: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID alat tidak valid.' })
        }

        try {
            const alat = await Alat.findById(req.params.id)
            if (!alat) return res.status(404).json({ message: 'Alat tidak ditemukan.' })
            return res.json(serializeAlat(alat))
        } catch (error) {
            return handleAlatError(error, res, 'mengambil detail alat')
        }
    },

    create: async (req, res) => {
        const { data, error } = validateAlatData(req.body)
        if (error) return res.status(400).json({ message: error })

        const { kode_alat: kodeAlat, reservation_token: reservationToken } = req.body
        if (
            typeof kodeAlat !== 'string' ||
            !/^KA-\d{3,}$/.test(kodeAlat) ||
            typeof reservationToken !== 'string'
        ) {
            return res.status(400).json({ message: 'Kode alat belum dicadangkan dengan benar.' })
        }

        try {
            const reservation = await Counter.findOneAndUpdate(
                {
                    _id: 'KA',
                    reservations: {
                        $elemMatch: {
                            kode_alat: kodeAlat,
                            token: reservationToken,
                            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                        },
                    },
                },
                { $pull: { reservations: { kode_alat: kodeAlat, token: reservationToken } } },
                { new: true }
            )
            if (!reservation) {
                return res.status(409).json({
                    message: 'Kode alat sudah kedaluwarsa atau sudah digunakan. Muat ulang form untuk kode baru.',
                })
            }

            const alat = await Alat.create({
                ...data,
                kode_alat: kodeAlat,
                tersedia: data.jumlah,
            })
            return res.status(201).json({
                message: 'Alat berhasil ditambahkan.',
                data: serializeAlat(alat),
            })
        } catch (createError) {
            return handleAlatError(createError, res, 'menambahkan alat')
        }
    },

    update: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID alat tidak valid.' })
        }

        const { data, error } = validateAlatData(req.body)
        if (error) return res.status(400).json({ message: error })

        try {
            const alat = await Alat.findById(req.params.id)
            if (!alat) return res.status(404).json({ message: 'Alat tidak ditemukan.' })

            const sedangDipinjam = alat.jumlah - alat.tersedia
            if (data.jumlah < sedangDipinjam) {
                return res.status(400).json({
                    message: `Jumlah tidak boleh kurang dari ${sedangDipinjam} unit yang sedang dipinjam.`,
                })
            }

            alat.nama_alat = data.nama_alat
            alat.kategori = data.kategori
            alat.jumlah = data.jumlah
            alat.tersedia = data.jumlah - sedangDipinjam
            alat.kondisi = data.kondisi
            alat.deskripsi = data.deskripsi
            if (data.gambar) alat.gambar = data.gambar
            if (data.status_aktif !== undefined) alat.status_aktif = data.status_aktif
            await alat.save()

            return res.json({
                message: 'Alat berhasil diperbarui.',
                data: serializeAlat(alat),
            })
        } catch (updateError) {
            return handleAlatError(updateError, res, 'memperbarui alat')
        }
    },

    remove: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID alat tidak valid.' })
        }

        try {
            const alat = await Alat.findByIdAndDelete(req.params.id)
            if (!alat) return res.status(404).json({ message: 'Alat tidak ditemukan.' })
            return res.json({ message: 'Alat berhasil dihapus.' })
        } catch (error) {
            return handleAlatError(error, res, 'menghapus alat')
        }
    },
}

module.exports = alatController
