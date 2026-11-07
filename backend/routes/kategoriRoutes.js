const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const kategoriController = require('../controllers/kategoriController')

const router = express.Router()

router.use(authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat mengelola kategori.' })
    }
    return next()
})

router.get('/', kategoriController.list)
router.get('/:id', kategoriController.detail)
router.post('/', kategoriController.create)
router.post('/reserve-code', kategoriController.reserveCode)
router.put('/:id', kategoriController.update)
router.delete('/:id', kategoriController.remove)

module.exports = router
