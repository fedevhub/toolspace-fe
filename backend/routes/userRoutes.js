const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const userController = require('../controllers/userController')

const router = express.Router()

router.use(authMiddleware, (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Hanya admin yang dapat mengelola pengguna.' })
    }
    return next()
})

router.get('/', userController.list)
router.post('/', userController.create)
router.get('/:id', userController.detail)
router.put('/:id', userController.update)
router.delete('/:id', userController.remove)

module.exports = router
