const users = require('../models/users.js')
const jwt = require('jsonwebtoken')
const auth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token
        if (!token) return next(new Error('Token was missing . Relogin the Page'))
        const decode = jwt.verify(token, process.env.securitykey)
        if (!decode) return next(new Error('Invalid Token'))
        const user = await users.findOne({
            where: {
                email: decode.email
            }
        })
        if (!user) return next(new Error('user not found'))
        socket.user = user
        next()
    }
    catch (e) {
        console.log(e)
    }
}
module.exports = { auth }