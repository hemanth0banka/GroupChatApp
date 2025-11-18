const { Sequelize } = require('sequelize')
console.log("Attempting to connect to DB. Dialect:", process.env.db_dialect);
const sequelize = new Sequelize(process.env.db_name,process.env.db_username, process.env.db_password, {
    host: process.env.db_host,
    dialect: process.env.db_dialect
});
(async () => {
    try {
        await sequelize.authenticate()
        console.log('DataBase Connected...')
    }
    catch (e) {
        console.log(e)
    }
})()
module.exports = sequelize