const express = require('express')
const route = express.Router()
const control = require('../controller/chats.js')
route.get('/', control.getControl)
module.exports = route