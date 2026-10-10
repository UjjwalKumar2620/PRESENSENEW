/**
 * AI Analysis API routes for PreSense.
 * Triggers OpenRouter visual analysis on selected camera footage
 * and manages persisted analysis reports.
 */

const { Router } = require('express');
const { analyzeCameraFootage } = require('../services/aiAnalysis');
const { saveAIReport, getAIReports, createIncident } = require('../db/repositories');

const router = Router();

/**
 * POST /api/analysis/analyze
 * Analyzes footage for a specific camera with OpenRouter vision.
 * Body parameters:
 * - cameraId: string ('CAM-01' ... 'CAM-09')
 * - windowMinutes: number (10 or 20)
 * - sessionDurationSeconds: number
 * - sampledFrames: Array<string> (base64 images)
 * - customContext: string (optional)
 * - autoCreateIncident: boolean (optional)
 */
router.post('/analyze', async (req, res) => {
  try {
    const {
      cameraId,
      windowMinutes = 10,
      sessionDurationSeconds = 120,
      sampledFrames = [],
      customContext = '',
      autoCreateIncident = false
    } = req.body;

    if (!cameraId) {
      return res.status(400).json({ success: false, error: 'cameraId is required.' });
    }

    console.log(`🤖 Starting AI Visual Analysis for ${cameraId} (Window: ${windowMinutes} min, ${sampledFrames.length} sampled frames)...`);

    const report = await analyzeCameraFootage({
      cameraId,
      windowMinutes,
      sessionDurationSeconds,
      sampledFrames,
      customContext
    });

    // Persist report in MongoDB Atlas
    await saveAIReport({
      reportId: report.reportId,
      cameraId,
      windowMinutes,
      actualAnalyzedDuration: report.summary?.actualAnalyzedDuration,
      report,
      sampledFramesCount: sampledFrames.length
    });

    // If an incident was detected with Respond or Emergency, or if autoCreateIncident was requested
    let createdIncident = null;
    const highestIncident = report.potentialIncidents?.[0];
    if (highestIncident && (highestIncident.severity === 'Respond' || highestIncident.severity === 'Emergency' || autoCreateIncident)) {
      createdIncident = await createIncident({
        cameraId,
        cameraName: report.summary?.cameraName,
        zone: report.summary?.zone,
        eventType: highestIncident.eventCategory,
        severity: highestIncident.severity,
        description: `[AI Finding] ${highestIncident.observedEvidence} (${highestIncident.reasoning})`,
        evidenceReference: `${cameraId} AI Report ${report.reportId}`,
        sourceType: 'ai_vision_analysis'
      });
    }

    res.json({
      success: true,
      report,
      createdIncident
    });
  } catch (err) {
    console.error('Error during AI analysis:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/analysis/reports
 * Retrieve recent saved reports.
 */
router.get('/reports', async (req, res) => {
  try {
    const { cameraId, limit = 10 } = req.query;
    const reports = await getAIReports(cameraId, parseInt(limit, 10));
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    console.error('Error fetching reports:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
