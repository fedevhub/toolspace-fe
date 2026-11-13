const mongoose = require('mongoose')

const pengembalianSchema = new mongoose.Schema({
    kode_pengembalian: { type: String, required: true, unique: true, trim: true, uppercase: true },
    peminjaman_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Peminjaman', required: true, unique: true },
    pengguna_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Alat', required: true },
    nama_peminjam: { type: String, required: true, trim: true },
    nama_alat: { type: String, required: true, trim: true },
    jumlah: { type: Number, required: true, min: 1 },
    tanggal_pengembalian: { type: String, required: true },
    kondisi: { type: String, required: true, enum: ['Baik', 'Rusak Ringan', 'Rusak Berat'] },
    denda: { type: Number, default: 0, min: 0 },
    status: { type: String, required: true, enum: ['Selesai', 'Denda', 'Menunggu'], default: 'Selesai' },
    keterangan: { type: String, trim: true, default: '', maxlength: 500 },
}, { timestamps: true })

module.exports = mongoose.model('Pengembalian', pengembalianSchema)
