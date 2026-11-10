const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const controller = require('../controllers/dashboardController')
const router = express.Router()
router.use(authMiddleware)
router.use((req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Hanya admin yang dapat melihat dashboard.' }))
router.get('/summary', controller.summary)
router.get('/activity', controller.activity)
module.exports = router
