const users = require('../models/users.js')
const rooms = require('../models/rooms.js')
const postControl = async (req, res,next) => {
    try {
        const { email } = req.body
        const r = await users.findOne({
            where: {
                email
            }
        })
        if (!r) {
            const error = new Error('user not found')
            error.statusCode = 404
            return next(error)
        }
        res.status(200).send(r)
    }
    catch (e) {
        next(e)
    }
}
const getControl = async (req, res,next) => {
    try {
        const roomId = req.params.id
        const r = await rooms.findOne({
            where: {
                roomId
            }
        })
        if (!r) {
            const error = new Error('No Room Found with RoomId')
            error.statusCode = 404
            return next(error)
        }
        res.status(200).send(r)
    }
    catch (e) {
        next(e)
    }
}
module.exports = { postControl, getControl }