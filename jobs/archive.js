const {CronJob} = require('cron');
const messages = require('../models/messages')
const old = require('../models/oldmessages.js')
const sequelize = require('../util/db.js')
const {Op, Transaction} = require('sequelize')
async function archive ()
{
    console.log("Archiveing...")
    const transaction = await sequelize.transaction()
    try
    {
        const time = new Date(Date.now() - (1000*60*60*24))
        const data = await messages.findAll({
            where: {
                created_at: {
                    [Op.lt]: time,
                },
            },
            raw: true,
            transaction
        })
        const r = await old.bulkCreate(data,{transaction})
        const res = await messages.destroy({
            where: {
                created_at: {
                    [Op.lt]: time,
                },
            },transaction
        })
        await transaction.commit()
    }
    catch(e)
    {
        console.log(e)
        await transaction.rollback()
    }
    
}
const job = new CronJob(
	'0 0 * * * *', archive
);
module.exports = job