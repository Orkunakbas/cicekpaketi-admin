const { Sequelize } = require('sequelize');

// Environment variables'dan oku (.env dosyasından gelir)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'orwys_database',
  process.env.DB_USER || 'orwys_user', 
  process.env.DB_PASSWORD || '3Op9^en61',
  {
    host: process.env.DB_HOST || '141.98.112.55',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

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