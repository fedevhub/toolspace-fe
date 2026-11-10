const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const alatController = require('../controllers/alatController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', (req, res, next) => {
    if (!['admin', 'peminjam'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Role ini tidak dapat melihat daftar alat.' })
    }
    return alatController.list(req, res, next)
})

router.use((req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat mengelola alat.' })
    }
    return next()
})

router.post('/', alatController.create)
router.post('/reserve-code', alatController.reserveCode)
router.get('/:id', alatController.detail)
router.put('/:id', alatController.update)
router.delete('/:id', alatController.remove)

module.exports = router
