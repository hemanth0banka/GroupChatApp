const express = require('express')
const route = express.Router()
const control = require('../controller/signup.js')
route.post('/signup', control.postControl)
route.post('/forgot', control.forgotpassword)
route.get('/forgot/:id', control.linkvalidate)
route.put('/forgot/:id', control.updatePassword)
module.exports = route
