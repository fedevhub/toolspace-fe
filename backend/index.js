require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/connectDb')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const alatRoutes = require('./routes/alatRoutes')
const kategoriRoutes = require('./routes/kategoriRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}))
app.use(express.json({ limit: '7mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend Toolspace berjalan' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/alat', alatRoutes)
app.use('/api/kategori', kategoriRoutes)
app.use((error, _req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Ukuran permintaan terlalu besar. Foto maksimal 5 MB.' })
    }
    return next(error)
})

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI belum diisi di backend/.env')
        process.exit(1)
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET belum diisi di backend/.env')
        process.exit(1)
    }

    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Backend Toolspace berjalan di http://localhost:${PORT}`)
            console.log(`Tes API: http://localhost:${PORT}/api/health`)
        })
    } catch (error) {
        console.error('Backend gagal dijalankan:', error.message)
        process.exit(1)
    }
}

startServer()
