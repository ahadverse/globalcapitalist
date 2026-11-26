const app = require('../server');
const connectDB = require('../config/database');

module.exports = async function handler(req, res) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  await connectDB();
  app(req, res);
};
