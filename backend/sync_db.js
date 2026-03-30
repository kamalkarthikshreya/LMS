require('dotenv').config({ path: './.env' });
const { sequelize } = require('./src/config/db');
const models = require('./src/models');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connection OK');
        await sequelize.sync({ alter: true });
        console.log('Sync OK');
    } catch(err) {
        console.error('SYNC ERROR', err);
    } finally {
        process.exit();
    }
}
sync();
