const { Sequelize } = require('sequelize');
const pg = require('pg'); // Force import at top level for bundlers

let sequelize;

if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL ERROR: DATABASE_URL is missing from environment variables!');
  // In serverless environments, we create a dummy instance to prevent top-level import crashes
  sequelize = new Sequelize('postgres://localhost:5432/dummy', {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg, // CRITICAL FIX for Vercel/Serverless
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
}

const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected (Neon)');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Do not process.exit(1) in serverless environments as it causes 500 errors
    throw error;
  }
};

module.exports = { sequelize, connectDB };
