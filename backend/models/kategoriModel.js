const mongoose = require('mongoose')

const kategoriSchema = new mongoose.Schema(
    {
        kode_kategori: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        nama_kategori: {
            type: String,
            required: true,
            trim: true
        },

        deskripsi: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Kategori', kategoriSchema)