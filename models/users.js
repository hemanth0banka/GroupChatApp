const {DataTypes} = require('sequelize')
const sequelize = require('../util/db.js')
const users = sequelize.define('users',{
    userId : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    username : {
        type : DataTypes.STRING,
        allowNull : false
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false
    },
    phone : {
        type : DataTypes.STRING,
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false
    }
})
module.exports = users