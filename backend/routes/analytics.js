/**
 * Analytics API routes for PreSense.
 * Computes live operational metrics based on actual incident and camera records.
 */

const { Router } = require('express');
const { getAnalyticsStats } = require('../db/repositories');
const { CAMERAS } = require('../config/cameras');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const stats = await getAnalyticsStats();
    stats.totalCameras = CAMERAS.length;
    stats.camerasOnline = CAMERAS.filter((c) => c.enabled !== false).length;

    res.json({
      success: true,
      analytics: stats,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching analytics:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
