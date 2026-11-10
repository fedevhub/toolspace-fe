const mongoose = require('mongoose')

const peminjamanSchema = new mongoose.Schema(
    {
        kode_peminjaman: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        pengguna_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        nama_peminjam: {
            type: String,
            required: true,
            trim: true,
        },
        alat_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Alat',
            required: true,
        },
        nama_alat: {
            type: String,
            required: true,
            trim: true,
        },
        kategori_alat: {
            type: String,
            trim: true,
            default: '',
        },
        jumlah: {
            type: Number,
            required: true,
            min: 1,
            validate: Number.isInteger,
        },
        keperluan: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        tanggal_pinjam: {
            type: String,
            required: true,
        },
        tanggal_kembali: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Menunggu', 'Disetujui', 'Ditolak'],
            default: 'Menunggu',
            required: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Peminjaman', peminjamanSchema)
