const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        id_pengguna: {
            type: String,
            unique: true,
            sparse: true,
            immutable: true,
            trim: true,
        },
        nama_lengkap: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'petugas', 'peminjam'],
        },
        status_aktif: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
