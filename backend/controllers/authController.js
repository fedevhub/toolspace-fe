const User = require('../models/userModels')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body

            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username dan password wajib diisi',
                })
            }

            const user = await User.findOne({ username: username.trim() })

            if (!user) {
                return res.status(401).json({
                    message: 'Username atau password salah',
                })
            }

            if (user.status_aktif === false) {
                return res.status(403).json({
                    message: 'Akun kamu tidak aktif',
                })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(401).json({
                    message: 'Username atau password salah',
                })
            }

            const token = jwt.sign(
                { id: user._id.toString(), role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            )

            return res.status(200).json({
                message: 'Login berhasil',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    nama: user.nama_lengkap,
                    role: user.role,
                },
            })
        } catch (error) {
            console.error('Error saat login:', error)
            return res.status(500).json({
                message: 'Terjadi kesalahan pada server',
            })
        }
    },

    logout: (req, res) => {
        // JWT stateless: frontend juga harus menghapus token dari localStorage.
        return res.status(200).json({ message: 'Logout berhasil' })
    },
}

module.exports = authController
