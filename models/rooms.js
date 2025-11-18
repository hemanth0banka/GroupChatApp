const {DataTypes} = require('sequelize')
const sequelize = require('../util/db.js')
const rooms = sequelize.define('rooms',{
    roomId : {
        type : DataTypes.STRING,
        primaryKey : true,
        allowNull : false
    },
    roomname : {
        type : DataTypes.STRING,
        allowNull : false
    },
    members : {
        type : DataTypes.JSON,
        allowNull : false
    }
})
module.exports = rooms