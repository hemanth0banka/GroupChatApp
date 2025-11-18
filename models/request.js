const { DataTypes } = require('sequelize')
const sequelize = require('../util/db.js')
const { toDefaultValue } = require('sequelize/lib/utils')
const request = sequelize.define('request',{
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    url : {
        type : DataTypes.STRING,
        allowNull : false
    },
    opened : {
        type : DataTypes.BOOLEAN,
        defaultValue : false
    }
})
module.exports = request