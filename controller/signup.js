const bcrypt = require('bcrypt')
const users = require('../models/users.js')
const request = require('../models/request.js')
const path = require('path')
const { v4: uuid } = require('uuid')
const Sib = require('sib-api-v3-sdk');
const time = 1000 * 60 * 5;
const postControl = async (req, res, next) => {
    try {
        const { username, email, phone, password } = req.body
        let user = await users.findOne({
            where: { email }
        })
        if (user) {
            const err = new Error('email already in use')
            err.statusCode = 400
            throw err
        }
        let pass = await bcrypt.hash(password, 10)
        const r = await users.create({ username, email, phone, password: pass })
        res.status(200).send('Registered Sucessfully')
    }
    catch (e) {
        next(e)
    }
}

const forgotpassword = async (req, res, next) => {
    try {
        const { email } = req.body
        const id = uuid()
        const user = await users.findOne({
            where: {
                email
            }
        })
        if (!user) {
            const error = new Error('no email found')
            error.statusCode = 404
            next(error)
        }
        await request.create({
            url: id,
            userUserId: user.userId
        })
        const link = `http://localhost:1000/user/forgot/${id}`
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SibapiKey;
        const emailapi = new Sib.TransactionalEmailsApi()

        const sender = {
            email: process.env.SIB_SENDER_EMAIL,
        }
        const receivers = [
            {
                email: email
            }
        ]
        let info = await emailapi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'password Reset Link',
            textContent: `click  this ${link} link to reset your password`
        })
        res.status(200).send('ok')
    }
    catch (e) {
        console.log(e)
        next(e)
    }
}

const linkvalidate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const r = await request.findOne({
            where: {
                url: id
            }
        })
        if (r.opened === true) {
            const error = new Error('link expired')
            error.statusCode = 400
            next(error)
        }
        if (new Date(r.created) < new Date(Date.now() - time)) {
            const error = new Error('link expired')
            error.statusCode = 400
            next(error)
        }
        r.opened = true
        await r.save()
        res.status(200).sendFile(path.join(__dirname, '../views', 'reset.html'))
    }
    catch (e) {
        next(e)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { password: p } = req.body;
        const userRequest = await request.findOne({
            where: {
                url: id
            },
            attributes: [],
            include: {
                model: users,
                attributes: ['email']
            }
        })
        const password = await bcrypt.hash(p, Number(process.env.salt))
        await users.update({ password }, {
            where: {
                email: userRequest.user.email
            }
        })
        res.status(200).send('ok')
    }
    catch (e) {
        next(e)
    }
}
module.exports = { postControl, forgotpassword, linkvalidate, updatePassword }