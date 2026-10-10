/**
 * Incident Management API routes for PreSense.
 * Handles incident creation, status lifecycle, action logging, and simulated demo events.
 */

const { Router } = require('express');
const { getIncidents, createIncident, updateIncidentStatus } = require('../db/repositories');
const { CAMERAS } = require('../config/cameras');

const router = Router();

/**
 * GET /api/incidents
 * Retrieve all incidents with optional filtering.
 */
router.get('/', async (req, res) => {
  try {
    const { status, severity, cameraId } = req.query;
    const incidents = await getIncidents({ status, severity, cameraId });
    res.json({
      success: true,
      count: incidents.length,
      incidents
    });
  } catch (err) {
    console.error('Error fetching incidents:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch incidents.' });
  }
});

/**
 * POST /api/incidents
 * Create a new verified or AI-generated incident.
 */
router.post('/', async (req, res) => {
  try {
    const { cameraId, eventType, severity, description, evidenceReference, sourceType, evidenceImageUrl } = req.body;

    if (!cameraId || !eventType) {
      return res.status(400).json({ success: false, error: 'cameraId and eventType are required.' });
    }

    const camera = CAMERAS.find((c) => (c.id === cameraId || c.cameraId === cameraId));
    const cameraName = camera ? (camera.displayName || camera.name) : cameraId;
    const zone = camera ? (camera.zone || camera.location) : 'Station Area';

    const incident = await createIncident({
      cameraId,
      cameraName,
      zone,
      eventType,
      severity: severity || 'Observe',
      description,
      evidenceReference,
      sourceType: sourceType || 'ai_observation',
      evidenceImageUrl
    });

    res.status(201).json({
      success: true,
      incident
    });
  } catch (err) {
    console.error('Error creating incident:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/incidents/:id
 * Transition incident status (New, Acknowledged, Assigned, Resolved, False Alarm).
 */
router.patch('/:id', async (req, res) => {
  try {
    const incidentId = req.params.id;
    const { status, operatorName, notes } = req.body;

    const validStatuses = ['New', 'Acknowledged', 'Assigned', 'Resolved', 'False Alarm'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await updateIncidentStatus(incidentId, status, operatorName, notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Incident ${incidentId} not found.` });
    }

    res.json({
      success: true,
      incident: updated
    });
  } catch (err) {
    console.error('Error updating incident:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/incidents/simulate
 * Scenario launcher for repeatable hackathon demonstrations.
 * Supported scenarios:
 * 1. unattended_object (CAM-03 Concourse) -> Level 1 Observe
 * 2. fight_activity (CAM-05 Waiting Lounge) -> Level 2 Respond
 * 3. restricted_zone (CAM-04 Server Vault) -> Level 2 Respond
 * 4. person_on_track (CAM-08 Platform 1) -> Level 3 Emergency
 */
router.post('/simulate', async (req, res) => {
  try {
    const { scenarioType } = req.body;

    const SCENARIOS = {
      unattended_object: {
        cameraId: 'CAM-03',
        eventType: 'Unattended Luggage Package',
        severity: 'Observe',
        description: '[SIMULATED DEMO] Hard-shell suitcase left unattended beside Ticketing Gate 3 for >10 minutes.',
        evidenceReference: 'CAM-03 Turnstile Zone Frame',
        sourceType: 'simulated_demo'
      },
      fight_activity: {
        cameraId: 'CAM-05',
        eventType: 'Physical Altercation Escalation',
        severity: 'Respond',
        description: '[SIMULATED DEMO] Aggressive pushing and physical dispute observed in East Waiting Lounge near seating block C.',
        evidenceReference: 'CAM-05 East Wing Frame',
        sourceType: 'simulated_demo'
      },
      restricted_zone: {
        cameraId: 'CAM-04',
        eventType: 'Unauthorized Access Perimeter Breach',
        severity: 'Respond',
        description: '[SIMULATED DEMO] Individual entered restricted access corridor outside Server Operations Vault without authorized badge.',
        evidenceReference: 'CAM-04 Security Hub Frame',
        sourceType: 'simulated_demo'
      },
      person_on_track: {
        cameraId: 'CAM-08',
        eventType: 'Person on Track Clearance Area',
        severity: 'Emergency',
        description: '[SIMULATED DEMO] Individual breached Platform 1 yellow threshold and descended into track roadbed clearance zone ahead of oncoming express.',
        evidenceReference: 'CAM-08 Platform 1 Frame',
        sourceType: 'simulated_demo'
      }
    };

    const scenario = SCENARIOS[scenarioType] || SCENARIOS.unattended_object;
    const camera = CAMERAS.find((c) => c.id === scenario.cameraId);

    const incident = await createIncident({
      cameraId: scenario.cameraId,
      cameraName: camera ? camera.displayName : scenario.cameraId,
      zone: camera ? camera.zone : 'Station Area',
      eventType: scenario.eventType,
      severity: scenario.severity,
      description: scenario.description,
      evidenceReference: scenario.evidenceReference,
      sourceType: scenario.sourceType
    });

    res.status(201).json({
      success: true,
      simulated: true,
      scenarioType,
      incident
    });
  } catch (err) {
    console.error('Error triggering simulation scenario:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
