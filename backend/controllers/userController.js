const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('../models/userModels')
const Counter = require('../models/counterModels')

const roles = ['admin', 'petugas', 'peminjam']

function serializeUser(user) {
    return {
        id: user._id.toString(),
        id_pengguna: user.id_pengguna,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        role: user.role,
        status_aktif: user.status_aktif,
    }
}

async function generateIdPengguna() {
    const prefix = 'KP'
    const existingUsers = await User.find({
        id_pengguna: new RegExp(`^${prefix}-(\\d+)$`),
    }).select('id_pengguna').lean()
    const highestExistingSequence = existingUsers.reduce((highest, user) => {
        const sequence = Number(user.id_pengguna.slice(prefix.length + 1))
        return Number.isSafeInteger(sequence) ? Math.max(highest, sequence) : highest
    }, 0)

    for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
            await Counter.updateOne(
                { _id: prefix },
                { $max: { sequence: highestExistingSequence } },
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
        if (counter) {
            return `${prefix}-${String(counter.sequence).padStart(3, '0')}`
        }
    }

    throw new Error('Tidak dapat membuat ID pengguna baru.')
}

function validateUserData(body, { creating = false } = {}) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Data pengguna tidak valid.' }
    }

    const data = {}
    for (const field of ['nama_lengkap', 'username', 'email', 'role']) {
        if (typeof body[field] !== 'string' || !body[field].trim()) {
            return { error: `${field} wajib diisi.` }
        }
        data[field] = body[field].trim()
    }

    data.email = data.email.toLowerCase()
    data.role = data.role.toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return { error: 'Format email tidak valid.' }
    }
    if (!roles.includes(data.role)) {
        return { error: 'Role harus admin, petugas, atau peminjam.' }
    }

    if (creating || body.password !== undefined) {
        if (typeof body.password !== 'string' || body.password.length < 6) {
            return { error: 'Password minimal 6 karakter.' }
        }
        data.password = body.password
    }

    return { data }
}

function handleUserError(error, res, action) {
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern ?? {})[0]
        return res.status(409).json({
            message: field === 'email'
                ? 'Email sudah digunakan.'
                : field === 'id_pengguna' ? 'ID pengguna sudah digunakan.' : 'Username sudah digunakan.',
        })
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Data pengguna tidak valid.',
            errors: Object.fromEntries(
                Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]])
            ),
        })
    }

    console.error(`Gagal ${action}:`, error)
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
}

const userController = {
    list: async (_req, res) => {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 })
            return res.json(users.map(serializeUser))
        } catch (error) {
            return handleUserError(error, res, 'mengambil pengguna')
        }
    },

    detail: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID pengguna tidak valid.' })
        }

        try {
            const user = await User.findById(req.params.id).select('-password')
            if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' })
            return res.json(serializeUser(user))
        } catch (error) {
            return handleUserError(error, res, 'mengambil detail pengguna')
        }
    },

    create: async (req, res) => {
        const { data, error } = validateUserData(req.body, { creating: true })
        if (error) return res.status(400).json({ message: error })

        try {
            data.password = await bcrypt.hash(data.password, 12)
            const user = await User.create({
                ...data,
                id_pengguna: await generateIdPengguna(),
            })
            return res.status(201).json({
                message: 'Pengguna berhasil ditambahkan.',
                data: serializeUser(user),
            })
        } catch (createError) {
            return handleUserError(createError, res, 'menambahkan pengguna')
        }
    },

    update: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID pengguna tidak valid.' })
        }

        const { data, error } = validateUserData(req.body)
        if (error) return res.status(400).json({ message: error })
        if (req.params.id === req.user.id && data.role !== 'admin') {
            return res.status(400).json({ message: 'Role akun admin yang sedang digunakan tidak dapat diubah.' })
        }

        try {
            const user = await User.findById(req.params.id)
            if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' })

            Object.assign(user, data)
            if (data.password) user.password = await bcrypt.hash(data.password, 12)
            await user.save()

            return res.json({
                message: 'Pengguna berhasil diperbarui.',
                data: serializeUser(user),
            })
        } catch (updateError) {
            return handleUserError(updateError, res, 'memperbarui pengguna')
        }
    },

    remove: async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID pengguna tidak valid.' })
        }
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Akun yang sedang digunakan tidak dapat dihapus.' })
        }

        try {
            const user = await User.findByIdAndDelete(req.params.id)
            if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' })
            return res.json({ message: 'Pengguna berhasil dihapus.' })
        } catch (error) {
            return handleUserError(error, res, 'menghapus pengguna')
        }
    },
}

module.exports = userController