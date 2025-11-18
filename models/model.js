const users = require('./users')
const rooms = require('./rooms')
const messages = require('./messages.js')
const request = require('./request.js')

users.hasMany(messages)
messages.belongsTo(users)

rooms.hasMany(messages)
messages.belongsTo(rooms)

users.hasMany(request)
request.belongsTo(users)

module.exports = { users, rooms }