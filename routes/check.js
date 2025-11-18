const express = require('express')
const route = express.Router()
const control = require('../controller/check.js')
route.post('/',control.postControl)
route.get('/:id',control.getControl)
module.exports = route