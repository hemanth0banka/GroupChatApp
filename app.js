const dotenv = require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const cors = require('cors')
const path = require('path')
const login = require('./routes/login.js')
const signup = require('./routes/signup.js')
const chats = require('./routes/chats.js')
const check = require('./routes/check.js')
const sequelize = require('./util/db.js')
const tokenValidator = require('./middlewares/tokenvalidator.js')
const errorHandler = require('./middlewares/errorHandler.js')
const io = require('./socket/index.js')
const job = require('./jobs/archive.js')
const port = process.env.PORT
require('./models/model.js')
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'pages', 'login.html')) })
app.use('/login', login)
app.use('/user', signup)
app.get('/home', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'pages', 'home.html')) })
io.connect(server);
app.use(tokenValidator)
app.use('/chats', chats)
app.use('/check', check)
app.use((req, res) => { res.status(404).send('Page Not Found...') })
app.use(errorHandler);
(async () => {
    try {
        await sequelize.sync({ alter: true })
        await job.start()
        server.listen(port, () => {
            console.log(`Listening at http://localhost:${port}/`)
        })
    }
    catch (e) {
        console.log(e)
    }
})()

