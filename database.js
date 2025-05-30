const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('orwys_database', 'orwys_user', '3Op9^en61', {
  host: '141.98.112.55',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanına başarıyla bağlandı.');
  } catch (error) {
    console.error('❌ Veritabanına bağlanılamadı:', error);
  }
}

testConnection();

module.exports = sequelize; 