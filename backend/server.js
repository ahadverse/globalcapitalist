require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length
    ? (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin))
    : true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'globalcapitalist API',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use(errorHandler);

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  await connectDB();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start API:', error);
    process.exitCode = 1;
  });
}

module.exports = app;
