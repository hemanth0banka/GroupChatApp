const sequelize = require('../util/db.js')
const messages = require('../models/messages.js')
const getControl = async (req, res, next) => {
    try {
        const [r] = await sequelize.query(`select * from rooms where members LIKE ?`, {
            replacements: [`%${req.user.email}%`]
        })
        res.status(200).send([{ email: req.user.email, username: req.user.username, userId: req.user.userId }, r])
    }
    catch (e) {
        next(e)
    }
}

module.exports = { getControl}