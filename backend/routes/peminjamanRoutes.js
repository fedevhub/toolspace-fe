const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const peminjamanController = require('../controllers/peminjamanController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', (req, res, next) => {
    if (!['admin', 'petugas', 'peminjam'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Role ini tidak dapat melihat peminjaman.' })
    }
    return next()
}, peminjamanController.list)

router.get('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat melihat detail peminjaman.' })
    }
    return next()
}, peminjamanController.detail)

router.post('/', (req, res, next) => {
    if (!['admin', 'peminjam'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Role ini tidak dapat mengajukan peminjaman.' })
    }
    return next()
}, peminjamanController.create)

router.put('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat memperbarui peminjaman.' })
    }
    return next()
}, peminjamanController.update)

router.delete('/:id', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat menghapus peminjaman.' })
    }
    return next()
}, peminjamanController.remove)

router.patch('/:id/status', (req, res, next) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Hanya petugas yang dapat mengubah status peminjaman.' })
    }
    return next()
}, peminjamanController.updateStatus)

module.exports = router
