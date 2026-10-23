require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const connectDB = require('./config/connectDb')
const User = require('./models/userModels')

async function seedAdmin() {
    const username = process.env.SEED_ADMIN_USERNAME
    const password = process.env.SEED_ADMIN_PASSWORD

    if (!username || !password) {
        throw new Error('Isi SEED_ADMIN_USERNAME dan SEED_ADMIN_PASSWORD di backend/.env terlebih dahulu')
    }

    await connectDB()

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        console.log(`User "${username}" sudah ada. Tidak ada perubahan data.`)
        return
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await User.create({
        nama_lengkap: process.env.SEED_ADMIN_NAME || 'Administrator Toolspace',
        username,
        email: process.env.SEED_ADMIN_EMAIL || 'admin@toolspace.local',
        password: hashedPassword,
        role: 'admin',
        status_aktif: true,
    })

    console.log(`Akun admin "${username}" berhasil dibuat.`)
}

seedAdmin()
    .catch((error) => {
        console.error('Gagal membuat akun admin:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })
