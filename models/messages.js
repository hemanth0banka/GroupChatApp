const { DataTypes } = require('sequelize')
const sequelize = require('../util/db.js')
const messages = sequelize.define('messages', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type : {
        type : DataTypes.STRING,
        allowNull : false
    }
})
module.exports = messages