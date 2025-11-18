const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const users = require('../models/users.js')
const postControl = async (req, res,next) => {
    try {
        const { username, password } = req.body
        let user = await users.findOne({
            where: {
                email: username
            }
        })
        if (!user) {
            user = await users.findOne({
                where: {
                    phone: username
                }
            })
            if (!user) {
                const error = new Error('User Not Found')
                error.statusCode = 404
                return next(error)
            }
        }
        const a = await bcrypt.compare(password, user.password)
        if (!a) {
            const error = new Error('Password Incorrect')
            error.statusCode = 400
            return next(error)
        }
        const token = jwt.sign({ username: user.username, email: user.email, userId: user.userId }, process.env.securitykey)
        res.status(200).send(token)
    }
    catch (e) {
        next(e)
    }
}
module.exports = { postControl }