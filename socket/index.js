const {Server} = require('socket.io')
const auth = require('./middleware.js')
const handle = require('./handler.js')
const connect = (server)=>{
    const io = new Server(server,{
        cors : {
            origin : '*'
        }
    })
    io.use(auth.auth)
    handle.room(io)
    handle.group(io)
}
module.exports = {connect}