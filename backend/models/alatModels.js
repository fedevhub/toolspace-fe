const mongoose = require('mongoose')

const alatSchema = new mongoose.Schema(
    {
        kode_alat: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        nama_alat: {
            type: String,
            required: true,
            trim: true,
        },
        kategori: {
            type: String,
            required: true,
            trim: true,
        },
        jumlah: {
            type: Number,
            required: true,
            min: 0,
            validate: Number.isInteger,
        },
        tersedia: {
            type: Number,
            required: true,
            min: 0,
            validate: Number.isInteger,
        },
        kondisi: {
            type: String,
            required: true,
            enum: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
        },
        deskripsi: {
            type: String,
            trim: true,
            default: '',
        },
        gambar: {
            type: String,
            default: '',
        },
        status_aktif: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Alat', alatSchema)
