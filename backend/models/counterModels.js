const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence: { type: Number, required: true, default: 0 },
    reservations: {
        type: [{
            kode_alat: { type: String },
            kode_kategori: { type: String, required: true },
            token: { type: String, required: true },
            createdAt: { type: Date, required: true },
        }],
        default: [],
    },
});

module.exports = mongoose.model('Counter', counterSchema)
