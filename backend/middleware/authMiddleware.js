const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization
    const [scheme, token] = authorization ? authorization.split(' ') : []

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token autentikasi diperlukan' })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        return next()
    } catch (error) {
        return res.status(401).json({ message: 'Token autentikasi tidak valid atau kedaluwarsa' })
    }
}

module.exports = authMiddleware
