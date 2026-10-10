/**
 * PreSense Backend Server
 *
 * Express server with:
 *   - MongoDB Atlas connection via GridFS
 *   - Camera list, status, and Range-capable video streaming
 *   - OpenRouter AI Visual Analysis service
 *   - Incident management lifecycle and simulated demo scenarios
 *   - Interactive venue map endpoints and operational analytics
 *   - Static dashboard serving and graceful shutdown
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, closeDB } = require('./db/connection');
const { initializeCollections } = require('./db/repositories');

// Route modules
const camerasRouter = require('./routes/cameras');
const incidentsRouter = require('./routes/incidents');
const analysisRouter = require('./routes/analysis');
const analyticsRouter = require('./routes/analytics');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Increased body limit to support base64 sampled video frames for AI analysis
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve frontend static files from ../frontend/
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/cameras', camerasRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PreSense CCTV Intelligence Backend',
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
    // Connect to MongoDB Atlas
    await connectDB();

    // Initialize incident and report collections & indexes
    await initializeCollections();

    app.listen(PORT, () => {
      console.log(`\n🚀 PreSense server running at http://localhost:${PORT}`);
      console.log(`📡 Cameras API:   http://localhost:${PORT}/api/cameras`);
      console.log(`📡 Incidents API: http://localhost:${PORT}/api/incidents`);
      console.log(`📡 Analysis API:  http://localhost:${PORT}/api/analysis/analyze`);
      console.log(`📡 Analytics API: http://localhost:${PORT}/api/analytics\n`);
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
