const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB berhasil terhubung')
    } catch (error) {
        console.error('Gagal menghubungkan MongoDB:', error.message)
        throw error
    }
}

module.exports = connectDB
