/**
 * Settings & System Health API routes for PreSense.
 * Safely exposes configuration status without exposing credentials.
 */

const { Router } = require('express');
const { getDB } = require('../db/connection');
const { CAMERAS } = require('../config/cameras');

const router = Router();

router.get('/', async (req, res) => {
  try {
    let mongoConnected = false;
    let gridFSCount = 0;

    try {
      const db = getDB();
      await db.command({ ping: 1 });
      mongoConnected = true;
      gridFSCount = await db.collection('videos.files').countDocuments({});
    } catch {
      mongoConnected = false;
    }

    const openRouterConfigured = !!process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

    res.json({
      success: true,
      settings: {
        demoMode: true,
        demoModeLabel: 'Prerecorded Loop Demonstration (Hackathon Mode)',
        venueType: 'Public Transit Terminal / Central Metro Station',
        analysisWindowOptions: [10, 20],
        analysisIntervalDefaultSeconds: 120,
        openRouter: {
          configured: openRouterConfigured,
          model,
          maskedKey: openRouterConfigured
            ? `${process.env.OPENROUTER_API_KEY.slice(0, 8)}...${process.env.OPENROUTER_API_KEY.slice(-4)}`
            : 'NOT_CONFIGURED'
        },
        database: {
          connected: mongoConnected,
          name: process.env.DB_NAME || 'presense',
          gridFSBucket: 'videos',
          gridFSVideoFilesCount: gridFSCount
        },
        camerasCount: CAMERAS.length,
        systemVersion: 'PreSense Core 2.4-Hackathon'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
