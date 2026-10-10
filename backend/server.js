/**
 * PreSense Backend Server
 *
 * Express server with:
 *   - MongoDB Atlas connection via GridFS
 *   - Camera list and video streaming API
 *   - Static file serving for the frontend
 *   - CORS support
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, closeDB } = require('./db/connection');
const camerasRouter = require('./routes/cameras');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files from ../frontend/
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/cameras', camerasRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PreSense Backend',
    timestamp: new Date().toISOString(),
  });
});

// Fallback: serve index.html for SPA-style routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Start server
async function start() {
  try {
    // Connect to MongoDB first
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 PreSense server running at http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api/cameras\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

start();
