const rooms = require('../models/rooms.js')
const messages = require('../models/messages.js')
const users = require('../models/users.js')
const { v4: uuid } = require('uuid')
const { S3 } = require('aws-sdk')
const group = (io) => {
    io.on('connection', (socket) => {
        socket.on('create-group', async ({ roomname, members }) => {
            try {
                const roomId = uuid()
                const r = await rooms.create({ roomId, roomname, members })
                socket.emit('join-group', {
                    roomId: roomId,
                    roomname: roomname,
                    messages: []
                })
            }
            catch (e) {
                console.log(e)
            }
        })
        socket.on('join-group', async ({ roomId }) => {
            try {
                const r = await rooms.findOne({
                    where: {
                        roomId
                    }
                })
                const members = r.members;
                r.members = [...members, socket.user.email];
                await r.save();
                socket.emit('join-group', {
                    roomId: roomId,
                    roomname: r.roomname,
                    messages: []
                })
            }
            catch (e) {
                console.log(e)
            }
        })
    })
}
const room = (io) => {
    io.on('connection', (socket) => {
        socket.on('join-room', async ({ roomId, roomname, members }) => {
            try {
                const r = await rooms.findOne({
                    where: {
                        roomId: roomId
                    }
                })
                if (!r) {
                    await rooms.create({
                        roomId: roomId,
                        roomname: roomname,
                        members: members
                    })
                }
                socket.join(roomId)
                const data = await messages.findAll({
                    where: {
                        roomRoomId: roomId
                    },
                    include: {
                        model: users,
                        attributes: ['username']
                    }
                })
                socket.emit('join-room', {
                    roomId: roomId,
                    roomname: roomname,
                    messages: data
                })
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('new-message', async ({ roomId, message }) => {
            try {
                const r = await messages.create({
                    roomRoomId: roomId,
                    message: message,
                    userUserId: socket.user.userId,
                    type: 'text'
                })
                io.to(roomId).emit('new-message', {
                    userUserId: socket.user.userId,
                    message: message,
                    roomId: r.roomRoomId,
                    id : r.id,
                    type: 'text',
                    user: { userId: socket.user.userId, username: socket.user.username }
                })
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('new-image', async ({ roomId, image, filename }) => {
            try {
                const s3 = new S3({ accessKeyId: process.env.aws_accesskey, secretAccessKey: process.env.aws_secretkey })
                const params = {
                    Bucket: process.env.aws_bucket,
                    Key: `images/${new Date().toISOString()}${filename}`,
                    Body: image,
                    ACL: 'public-read'
                }
                const response = await s3.upload(params).promise()
                const r = await messages.create({
                    roomRoomId: roomId,
                    message: response.Location,
                    userUserId: socket.user.userId,
                    type: 'image'
                })
                io.to(roomId).emit('new-message', {
                    userUserId: socket.user.userId,
                    message: response.Location,
                    roomId: r.roomRoomId,
                    id : r.id,
                    type: 'image',
                    user: { userId: socket.user.userId, username: socket.user.username }
                })
            }
            catch (e) {
                console.log(e)
            }
            console.log(image)
        })

        socket.on('delete-message', async ({ id, roomId }) => {
            try {
                await messages.destroy({
                    where: { id: Number(id) }
                })
                io.to(roomId).emit('delete-message', {
                    msgId: id,
                    roomId: roomId
                })
            }
            catch (e) {
                console.log(e)
            }
        })
    })
}
module.exports = { group, room }