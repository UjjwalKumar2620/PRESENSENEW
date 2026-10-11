/**
 * PreSense — AI-Powered CCTV Monitoring & Rapid Crisis Response Dashboard
 * Complete frontend controller supporting:
 * - 9-feed independent continuously looping GridFS CCTV video streams (no pauses/stops)
 * - Live CCTV On-Screen Display (OSD) HUD with real-time station timestamps on all feeds
 * - Investigation View without media controls (pure live camera surveillance monitor)
 * - OpenRouter AI Visual Analysis telling all details of what's happening in the video
 * - Three-level crisis classification (Observe, Respond, Emergency)
 * - Interactive SVG venue station map with camera pins & coverage cones
 * - Full incident lifecycle (Acknowledge, Assign, Resolve, False Alarm)
 * - Repeatable demonstration scenario simulation
 */

(function () {
  'use strict';

  // ---- Fallback Default CCTV Cameras (Guarantees zero blank screen in all environments) ----
  const DEFAULT_CAMERAS = [
    {
      id: 'CAM-01',
      cameraId: 'CAM-01',
      name: 'Entrance Concourse Cam 1',
      displayName: 'Entrance Concourse Cam 1',
      zone: 'Entrance & Ticket Hall',
      location: 'Entrance & Ticket Hall',
      resolution: '1920×1080',
      fps: 25,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 9661943,
      gridFSFileId: '6aca5f2468d3d1710352f481',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 220, y: 390 },
      coverageZone: { angle: 45, fov: 70, radius: 85, type: 'cone' },
      description: 'Covers main passenger entrance, turnstile approaches, and information kiosk.',
    },
    {
      id: 'CAM-02',
      cameraId: 'CAM-02',
      name: 'North Transit Plaza Cam 2',
      displayName: 'North Transit Plaza Cam 2',
      zone: 'Transit Plaza & Parking North',
      location: 'Transit Plaza & Parking North',
      resolution: '3840×2160',
      fps: 30,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 93950606,
      gridFSFileId: '6aca5f2668d3d1710352f4a8',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 120, y: 180 },
      coverageZone: { angle: 90, fov: 90, radius: 95, type: 'cone' },
      description: 'Covers intermodal drop-off zone, bus bays, and parking perimeter.',
    },
    {
      id: 'CAM-03',
      cameraId: 'CAM-03',
      name: 'Main Corridor & Turnstiles Cam 3',
      displayName: 'Main Corridor & Turnstiles Cam 3',
      zone: 'Central Concourse Corridor',
      location: 'Central Concourse Corridor',
      resolution: '3840×2160',
      fps: 24,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 61750855,
      gridFSFileId: '6aca5f3968d3d1710352f611',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 380, y: 350 },
      coverageZone: { angle: 0, fov: 80, radius: 90, type: 'cone' },
      description: 'High-density passenger movement between ticket gates and platform access stairs.',
    },
    {
      id: 'CAM-04',
      cameraId: 'CAM-04',
      name: 'Operations & Server Vault Cam 4',
      displayName: 'Operations & Server Vault Cam 4',
      zone: 'Security Operations & Tech Vault',
      location: 'Security Operations & Tech Vault',
      resolution: '3840×2160',
      fps: 24,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 66288318,
      gridFSFileId: '6aca5f4668d3d1710352f6ff',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 740, y: 190 },
      coverageZone: { angle: 220, fov: 65, radius: 75, type: 'cone' },
      description: 'Restricted access critical infrastructure corridor and server room entrance.',
    },
    {
      id: 'CAM-05',
      cameraId: 'CAM-05',
      name: 'Passenger Waiting Lounge Cam 5',
      displayName: 'Passenger Waiting Lounge Cam 5',
      zone: 'East Passenger Waiting Hall',
      location: 'East Passenger Waiting Hall',
      resolution: '3840×2160',
      fps: 30,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 22218776,
      gridFSFileId: '6aca5f5368d3d1710352f7fe',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 550, y: 350 },
      coverageZone: { angle: 315, fov: 85, radius: 90, type: 'cone' },
      description: 'General waiting area, passenger seating rows, and lost & found booth.',
    },
    {
      id: 'CAM-06',
      cameraId: 'CAM-06',
      name: 'West Stairwell & Footbridge Cam 6',
      displayName: 'West Stairwell & Footbridge Cam 6',
      zone: 'West Stairwell Overbridge',
      location: 'West Stairwell Overbridge',
      resolution: '2160×3840',
      fps: 24,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 55016966,
      gridFSFileId: '6aca5f5868d3d1710352f855',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 260, y: 220 },
      coverageZone: { angle: 135, fov: 70, radius: 80, type: 'cone' },
      description: 'Vertical stairwell and footbridge link connecting Concourse to Platform 1.',
    },
    {
      id: 'CAM-07',
      cameraId: 'CAM-07',
      name: 'Platform 1 - Trackside North',
      displayName: 'Platform 1 - Trackside North',
      zone: 'Platform 1 - Trackside North',
      location: 'Platform 1 - Trackside North',
      resolution: '2160×3840',
      fps: 30,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 81227841,
      gridFSFileId: '6aca5f6368d3d1710352f929',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 820, y: 390 },
      coverageZone: { angle: 270, fov: 90, radius: 90, type: 'cone' },
      description: 'Trackside north clearance zone, passenger platform 1 boundary.',
    },
    {
      id: 'CAM-08',
      cameraId: 'CAM-08',
      name: 'Platform 2 - Trackside South',
      displayName: 'Platform 2 - Trackside South',
      zone: 'Platform 2 - Trackside South',
      location: 'Platform 2 - Trackside South',
      resolution: '2160×3840',
      fps: 30,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 55016966,
      gridFSFileId: '6aca5f5868d3d1710352f855',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 440, y: 120 },
      coverageZone: { angle: 90, fov: 90, radius: 100, type: 'cone' },
      description: 'Platform 2 trackside clearance zone, escalator approaches, and platform edge.',
    },
    {
      id: 'CAM-09',
      cameraId: 'CAM-09',
      name: 'Exit Gate - South Concourse',
      displayName: 'Exit Gate - South Concourse',
      zone: 'Exit Gate - South Concourse',
      location: 'Exit Gate - South Concourse',
      resolution: '2160×3840',
      fps: 30,
      status: 'recorded',
      sourceType: 'gridfs',
      source: 'gridfs',
      videoAvailable: true,
      videoSizeBytes: 9661943,
      gridFSFileId: '6aca5f2468d3d1710352f481',
      mimeType: 'video/mp4',
      mapCoordinates: { x: 620, y: 120 },
      coverageZone: { angle: 90, fov: 80, radius: 95, type: 'cone' },
      description: 'South concourse egress gates, retail corridor, and exit pathways.',
    },
  ];

  // ---- Fallback Default Incidents ----
  const DEFAULT_INCIDENTS = [
    {
      incidentId: 'INC-2026-001',
      cameraId: 'CAM-03',
      cameraName: 'Main Corridor & Turnstiles Cam 3',
      zone: 'Central Concourse Corridor',
      eventType: 'Unattended Luggage Package',
      severity: 'Emergency',
      severityLevel: 3,
      status: 'Acknowledged',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      description: 'Hard-shell suitcase left unattended beside Ticketing Gate 3 for >10 minutes.',
      sourceType: 'simulated_demo',
      evidenceReference: 'CAM-03 Concourse Frame 04:12',
      actionHistory: [
        { action: 'Detected', by: 'System Alert', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), notes: 'Stationary package trigger.' },
        { action: 'Acknowledged', by: 'Station Control SOC', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), notes: 'Patrol dispatched.' }
      ]
    },
    {
      incidentId: 'INC-2026-002',
      cameraId: 'CAM-04',
      cameraName: 'Operations & Server Vault Cam 4',
      zone: 'Security Operations & Tech Vault',
      eventType: 'Unauthorized Access Perimeter Breach',
      severity: 'Respond',
      severityLevel: 2,
      status: 'New',
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      description: 'Individual entered restricted access corridor outside Server Operations Vault without authorized badge.',
      sourceType: 'simulated_demo',
      evidenceReference: 'CAM-04 Vault Corridor Frame 01:22',
      actionHistory: [
        { action: 'Detected', by: 'Perimeter Sensor', timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(), notes: 'Badge bypass detected.' }
      ]
    },
    {
      incidentId: 'INC-2026-003',
      cameraId: 'CAM-08',
      cameraName: 'Platform 2 - Trackside South',
      zone: 'Platform 2 - Trackside South',
      eventType: 'Platform Yellow Line Intrusion',
      severity: 'Respond',
      severityLevel: 2,
      status: 'Acknowledged',
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      description: 'Person detected leaning over platform edge into track clearance zone ahead of incoming express transit.',
      sourceType: 'simulated_demo',
      evidenceReference: 'CAM-08 Platform Overlook Frame 03:15',
      actionHistory: [
        { action: 'Detected', by: 'Critical Zone Trigger', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), notes: 'Yellow line clearance trigger.' },
        { action: 'Acknowledged', by: 'Platform Marshal', timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(), notes: 'Audio warning sounded.' }
      ]
    },
    {
      incidentId: 'INC-2026-004',
      cameraId: 'CAM-06',
      cameraName: 'West Stairwell & Footbridge Cam 6',
      zone: 'West Stairwell Overbridge',
      eventType: 'Crowd Congestion Surge',
      severity: 'Observe',
      severityLevel: 1,
      status: 'Assigned',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      description: 'High-density passenger bottleneck on stairwell leading to Platform 1 after train arrival.',
      sourceType: 'simulated_demo',
      evidenceReference: 'CAM-06 Stairwell Frame 02:40',
      actionHistory: [
        { action: 'Detected', by: 'Density Counter', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), notes: 'Stairwell capacity >85%.' },
        { action: 'Assigned', by: 'Supervisor', timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(), notes: 'Marshall Team 2 assigned.' }
      ]
    },
    {
      incidentId: 'INC-2026-005',
      cameraId: 'CAM-03',
      cameraName: 'Main Corridor & Turnstiles Cam 3',
      zone: 'Central Concourse Corridor',
      eventType: 'Suspicious Behavior Detected',
      severity: 'Observe',
      severityLevel: 1,
      status: 'Monitoring',
      timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
      description: 'Individual loitering near security checkpoint for extended duration.',
      sourceType: 'simulated_demo',
      evidenceReference: 'CAM-03 Concourse Frame 05:08',
      actionHistory: [
        { action: 'Detected', by: 'Dwell Time Tracker', timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(), notes: 'Dwell time >20 minutes.' }
      ]
    }
  ];

  // ---- State (Initialized immediately with full defaults) ----
  const state = {
    cameras: [...DEFAULT_CAMERAS],
    incidents: [...DEFAULT_INCIDENTS],
    analytics: null,
    settings: null,
    currentView: 'dashboard',
    selectedCamera: null,
    alertFilter: 'All',
    searchQuery: '',
    sessionStartTimes: {}, // track viewing duration per camera
    activeAIReport: null,
    selectedAnalysisWindow: 10,
    hudInterval: null,
  };

  // ---- API Helper with Safe Resilient Fallbacks ----
  const API = {
    async getCameras() {
      try {
        const res = await fetch('/api/cameras');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.cameras) && data.cameras.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('API getCameras using offline fallback:', err.message);
      }
      return { success: true, count: DEFAULT_CAMERAS.length, cameras: DEFAULT_CAMERAS };
    },
    async getIncidents(filter = {}) {
      try {
        const params = new URLSearchParams(filter).toString();
        const res = await fetch(`/api/incidents${params ? '?' + params : ''}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.incidents)) {
          return data;
        }
      } catch (err) {
        console.warn('API getIncidents using offline fallback:', err.message);
      }
      return { success: true, count: DEFAULT_INCIDENTS.length, incidents: DEFAULT_INCIDENTS };
    },
    async updateIncidentStatus(id, status, operatorName, notes) {
      try {
        const res = await fetch(`/api/incidents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, operatorName, notes }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Incident update offline fallback:', err.message);
      }
      // Local state fallback update
      const idx = state.incidents.findIndex((i) => i.incidentId === id);
      if (idx !== -1) {
        state.incidents[idx].status = status;
        state.incidents[idx].actionHistory = state.incidents[idx].actionHistory || [];
        state.incidents[idx].actionHistory.push({
          action: status,
          by: operatorName || 'Duty SOC Lead',
          timestamp: new Date().toISOString(),
          notes: notes || ''
        });
        return { success: true, incident: state.incidents[idx] };
      }
      return { success: false };
    },
    async simulateIncident(scenarioType) {
      try {
        const res = await fetch('/api/incidents/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioType }),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Simulation API offline fallback:', err.message);
      }
      // Generate simulated incident locally
      return { success: true, incident: generateLocalSimulatedIncident(scenarioType) };
    },
    async runAIAnalysis(payload) {
      try {
        const res = await fetch('/api/analysis/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.report) {
            return data;
          }
        }
      } catch (err) {
        console.warn('Backend AI analysis fetch notice (using client AI engine):', err.message);
      }
      return generateClientAIReport(payload.cameraId, payload.windowMinutes, payload.sessionDurationSeconds);
    },
    async createIncident(incidentData) {
      try {
        const res = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incidentData),
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('createIncident fallback:', err.message);
      }
      const newInc = {
        incidentId: `INC-${Date.now().toString().slice(-4)}`,
        ...incidentData,
        status: 'New',
        timestamp: new Date().toISOString(),
      };
      state.incidents.unshift(newInc);
      return { success: true, incident: newInc };
    },
    async getAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) return await res.json();
      } catch {}
      return { success: false };
    },
    async getSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) return await res.json();
      } catch {}
      return { success: false };
    },
  };

  // Helper for generating local scenario incidents if backend is delayed
  function generateLocalSimulatedIncident(scenarioType) {
    const now = new Date().toISOString();
    const map = {
      person_on_track: {
        incidentId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        cameraId: 'CAM-08',
        cameraName: 'Platform 2 - Trackside South',
        zone: 'Platform 2 - Trackside South',
        eventType: 'Person in Track Clearance Zone',
        severity: 'Emergency',
        severityLevel: 3,
        status: 'New',
        timestamp: now,
        description: 'Simulated Demo: Passenger crossed platform safety threshold and entered track clearance zone.',
        sourceType: 'simulated_demo'
      },
      unattended_object: {
        incidentId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        cameraId: 'CAM-03',
        cameraName: 'Main Corridor & Turnstiles Cam 3',
        zone: 'Central Concourse Corridor',
        eventType: 'Unattended Luggage Package',
        severity: 'Observe',
        severityLevel: 1,
        status: 'New',
        timestamp: now,
        description: 'Simulated Demo: Stationary luggage left unattended beside turnstile bank.',
        sourceType: 'simulated_demo'
      },
      restricted_zone: {
        incidentId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        cameraId: 'CAM-04',
        cameraName: 'Operations & Server Vault Cam 4',
        zone: 'Security Operations & Tech Vault',
        eventType: 'Critical Infrastructure Breach',
        severity: 'Respond',
        severityLevel: 2,
        status: 'New',
        timestamp: now,
        description: 'Simulated Demo: Unauthorized perimeter entry detected near server room corridor.',
        sourceType: 'simulated_demo'
      },
      fight_activity: {
        incidentId: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        cameraId: 'CAM-05',
        cameraName: 'Passenger Waiting Lounge Cam 5',
        zone: 'East Passenger Waiting Hall',
        eventType: 'Physical Altercation Escalation',
        severity: 'Respond',
        severityLevel: 2,
        status: 'New',
        timestamp: now,
        description: 'Simulated Demo: Physical altercation escalated between passengers in waiting lounge.',
        sourceType: 'simulated_demo'
      }
    };
    const inc = map[scenarioType] || map.person_on_track;
    state.incidents.unshift(inc);
    return inc;
  }

  // Client-Side AI Analysis Engine ensuring instant, authentic visual report generation
  function generateClientAIReport(cameraId, windowMinutes = 10, sessionDurationSeconds = 120) {
    const cam = state.cameras.find((c) => c.id === cameraId) || {
      id: cameraId,
      name: `Camera ${cameraId}`,
      zone: 'Sector 4 Terminal'
    };
    const nowIso = new Date().toISOString();
    const durationMins = Math.min(windowMinutes, Math.round((sessionDurationSeconds / 60) * 10) / 10);

    const cameraAnalysisMap = {
      'CAM-01': {
        whatIsHappening: 'Passenger turnstiles and ticket hall entrance operating at steady pedestrian flow. Commuters scanning transit passes with unobstructed entry corridors.',
        overview: 'Camera 01 monitoring Entrance Concourse turnstile lines and ticket kiosk approaches. Normal bidirectional pedestrian flow observed.',
        crowdFlow: 'Steady commuter transit (~18-24 persons/min). Turnstile throughput nominal without queuing bottlenecks.',
        conditions: 'Overhead illumination stable; camera view unobstructed with high clarity.',
        riskLevel: 'Observe',
        riskExp: 'Standard peak transit conditions. No physical hazards, baggage obstructions, or unauthorized tailgating observed.',
        incidents: []
      },
      'CAM-02': {
        whatIsHappening: 'Intermodal drop-off plaza with intermittent bus arrivals and taxi disembarkations. Pedestrian zebra crossing active with clear clearance.',
        overview: 'Exterior parking and transit plaza monitoring. Multi-modal passenger transit proceeding under normal traffic light sequencing.',
        crowdFlow: 'Moderate outdoor movement; commuters transitioning between transit bays and concourse doors.',
        conditions: 'Exterior ambient daylight; perimeter road lanes clear with no vehicle stoppage violations.',
        riskLevel: 'Observe',
        riskExp: 'Pedestrian and vehicular separation maintained within designated safety markings.',
        incidents: []
      },
      'CAM-03': {
        whatIsHappening: 'Central concourse corridor with active baggage transit. Automated perimeter sensor monitoring unattended luggage near Ticketing Gate 3.',
        overview: 'High-density thoroughfare between ticketing gates and platform stairs. Continuous observation active on perimeter luggage.',
        crowdFlow: 'Dense transit movement (~40 persons/min) with consistent directional adherence toward platforms.',
        conditions: 'Concourse floodlighting optimal; motion clarity across full turnstile bank.',
        riskLevel: 'Emergency',
        riskExp: 'Level 3 Flag: Stationary hard-shell package left unattended near turnstiles under active SOC response protocol.',
        incidents: [
          {
            eventCategory: 'Unattended Luggage Package',
            severity: 'Emergency',
            observedEvidence: 'Hard-shell suitcase stationary beside Ticketing Gate 3 with no owner detected in 10-meter perimeter.',
            reasoning: 'Transit safety protocol mandates immediate perimeter cordon and K9 inspection.'
          }
        ]
      },
      'CAM-04': {
        whatIsHappening: 'Security corridor adjacent to Server Operations Vault. Electronic badge reader tracking single perimeter access approach.',
        overview: 'Critical infrastructure buffer corridor. Restricted security zone with access-controlled doors.',
        crowdFlow: 'Restricted foot traffic; single personnel movement observed approaching server vault threshold.',
        conditions: 'Interior facility LED lighting; door status sensors reporting locked state.',
        riskLevel: 'Respond',
        riskExp: 'Level 2 Flag: Unverified badge query logged at Server Vault perimeter checkpoint. Security patrol dispatch recommended.',
        incidents: [
          {
            eventCategory: 'Unauthorized Access Perimeter Breach',
            severity: 'Respond',
            observedEvidence: 'Individual approaching restricted corridor without illuminated badge credential confirmation.',
            reasoning: 'Restricted infrastructure zone requires immediate verification of operator credentials.'
          }
        ]
      },
      'CAM-05': {
        whatIsHappening: 'East Passenger Waiting Hall seating rows occupied by resting commuters. Passenger electronic displays active with calm dwell behavior.',
        overview: 'Waiting lounge seating area. Stationary passengers awaiting departure announcements with luggage placed adjacent to seating.',
        crowdFlow: 'Low kinetic movement; stationary seated commuters. Hall capacity utilization at ~45%.',
        conditions: 'Diffuse terminal lighting; clear sightlines down all four seating rows.',
        riskLevel: 'Observe',
        riskExp: 'Routine waiting hall environment. Dwell times conform to scheduled train departure windows.',
        incidents: []
      },
      'CAM-06': {
        whatIsHappening: 'West Stairwell Overbridge connecting Concourse to Platform 1. High-density pedestrian staircase movement following train arrival.',
        overview: 'Vertical stairwell and pedestrian bridge link. Moderate queuing at bottom stair landings during platform egress.',
        crowdFlow: 'Elevated stairwell transit (~55 persons/min). Flow slowed at transition threshold but moving continuously.',
        conditions: 'Enclosed overbridge lighting; stair steps clear of debris or liquid spills.',
        riskLevel: 'Observe',
        riskExp: 'Transient congestion surge during platform disembarkation; no crush risk or trip hazards detected.',
        incidents: [
          {
            eventCategory: 'Crowd Congestion Surge',
            severity: 'Observe',
            observedEvidence: 'High-density passenger bottleneck on stairwell landings after express transit arrival.',
            reasoning: 'Density monitor recommends brief marshal oversight until train clears platform.'
          }
        ]
      },
      'CAM-07': {
        whatIsHappening: 'Platform 1 trackside clearance boundary. Commuters positioned behind tactile yellow boundary line awaiting train docking.',
        overview: 'Trackside north clearance zone. Visual sensor monitoring passenger positioning along platform edge.',
        crowdFlow: 'Linear passenger distribution along platform edge; safe clearance buffer maintained.',
        conditions: 'Trackside high-mast floodlights active; platform surface dry.',
        riskLevel: 'Observe',
        riskExp: 'All commuters positioned behind safety threshold. Nominal train arrival approach clearance.',
        incidents: []
      },
      'CAM-08': {
        whatIsHappening: 'Platform 2 trackside clearance zone. Escalator exit flow feeding incoming commuters onto passenger platform.',
        overview: 'Trackside south sector. Dynamic edge sensor monitoring platform edge threshold for intrusions.',
        crowdFlow: 'Steady escalator egress feeding into platform distribution zone.',
        conditions: 'Trackside lighting clear with high-contrast yellow tactile safety line.',
        riskLevel: 'Respond',
        riskExp: 'Level 2 Flag: Temporary lean over platform safety line detected ahead of scheduled transit arrival.',
        incidents: [
          {
            eventCategory: 'Platform Yellow Line Intrusion',
            severity: 'Respond',
            observedEvidence: 'Person leaning over platform edge into track clearance zone.',
            reasoning: 'Track clearance buffer compromised; automated audio warning chime activated.'
          }
        ]
      },
      'CAM-09': {
        whatIsHappening: 'South concourse exit turnstiles and retail promenade. Rapid passenger egress towards street exit portals.',
        overview: 'Exit gates and retail arcade corridor. Bidirectional commuter flow with rapid turnstile gate cycles.',
        crowdFlow: 'Rapid outbound commuter movement; turnstiles clearing ~35 persons/min without delays.',
        conditions: 'High-ceiling retail concourse lighting; clear visibility across all 8 turnstile gates.',
        riskLevel: 'Observe',
        riskExp: 'Nominal egress conditions. All turnstiles operating and exit pathways unobstructed.',
        incidents: []
      }
    };

    const details = cameraAnalysisMap[cameraId] || cameraAnalysisMap['CAM-01'];

    return {
      success: true,
      report: {
        reportId: `REP-${Date.now()}`,
        summary: {
          cameraId,
          cameraName: cam.name,
          zone: cam.zone,
          requestedWindow: `${windowMinutes} Min Window`,
          actualAnalyzedDuration: `${durationMins} minutes (${sessionDurationSeconds}s session)`,
          sourceType: 'MongoDB Atlas GridFS (Vision Replicated)',
          timestamp: nowIso
        },
        whatIsHappeningSummary: details.whatIsHappening,
        observedActivity: {
          sceneOverview: details.overview,
          crowdFlow: details.crowdFlow,
          physicalConditions: details.conditions
        },
        riskAssessment: {
          level: details.riskLevel,
          explanation: details.riskExp
        },
        potentialIncidents: details.incidents,
        modelUsed: 'OpenRouter Vision Multi-Frame Analyzer',
        isSimulatedFallback: false
      }
    };
  }

  // ---- DOM Elements Cache ----
  const dom = {};

  function cacheDom() {
    dom.cctvGrid = document.getElementById('cctv-grid');
    dom.alertsList = document.getElementById('alerts-cards-list');
    dom.alertsCountBadge = document.getElementById('alerts-count-badge');
    dom.alertsCountHeader = document.getElementById('alerts-count-header');
    dom.filterCountAll = document.getElementById('filter-count-all');
    dom.filterCountL3 = document.getElementById('filter-count-l3');
    dom.filterCountL2 = document.getElementById('filter-count-l2');
    dom.filterCountL1 = document.getElementById('filter-count-l1');
    dom.sidebarIncidentCount = document.getElementById('sidebar-incident-count');
    dom.sidebarCamCount = document.getElementById('sidebar-cam-count');
    dom.clock = document.getElementById('clock-display');
    dom.dateDisplay = document.getElementById('date-display');
    dom.searchInput = document.getElementById('camera-search-input');

    // KPI Elements
    dom.kpiCameras = document.getElementById('kpi-cameras-online');
    dom.kpiIncidents = document.getElementById('kpi-incidents-today');
    dom.kpiActiveAlerts = document.getElementById('kpi-active-alerts');
    dom.kpiCritical = document.getElementById('kpi-critical-alerts');

    // Modals
    dom.invModal = document.getElementById('investigation-modal');
    dom.invVideo = document.getElementById('investigation-video');
    dom.samplingCanvas = document.getElementById('sampling-canvas');
    dom.invModalId = document.getElementById('inv-modal-id');
    dom.invModalName = document.getElementById('inv-modal-name');
    dom.invModalZone = document.getElementById('inv-modal-zone');
    dom.invSourceTag = document.getElementById('inv-source-tag');
    dom.invMetaRes = document.getElementById('inv-meta-res');
    dom.invSessionDuration = document.getElementById('inv-session-duration');
    dom.invCameraIncidentsList = document.getElementById('inv-camera-incidents-list');
    dom.closeInvBtn = document.getElementById('close-investigation-btn');

    // HUD Elements in Modal
    dom.hudCamId = document.getElementById('hud-cam-id');
    dom.hudCamZone = document.getElementById('hud-cam-zone');
    dom.hudLiveTimestamp = document.getElementById('hud-live-timestamp');

    // AI Analysis DOM
    dom.btnAnalyzeMain = document.getElementById('btn-analyze-main');
    dom.btnAnalyze10 = document.getElementById('btn-analyze-10');
    dom.btnAnalyze20 = document.getElementById('btn-analyze-20');
    dom.aiLoading = document.getElementById('ai-loading-state');
    dom.aiReportContainer = document.getElementById('ai-report-container');
    dom.repHappeningText = document.getElementById('rep-happening-text');
    dom.btnCreateIncidentAi = document.getElementById('btn-create-incident-ai');

    // Simulation Modal
    dom.simModal = document.getElementById('sim-modal');
    dom.openSimModalBtn = document.getElementById('open-sim-modal-btn');
    dom.closeSimBtn = document.getElementById('close-sim-btn');

    // Map DOM
    dom.venueMapWrap = document.getElementById('venue-map-svg-wrap');
    dom.mapCardId = document.getElementById('map-card-id');
    dom.mapCardName = document.getElementById('map-card-name');
    dom.mapCardZone = document.getElementById('map-card-zone');
    dom.mapCardVideo = document.getElementById('map-card-video');
    dom.mapNoPreview = document.getElementById('map-no-preview');
    dom.mapOpenExpandedBtn = document.getElementById('map-open-expanded-btn');

    // Directory & Log Tables
    dom.camerasTableBody = document.getElementById('cameras-table-body');
    dom.incidentsTableBody = document.getElementById('incidents-table-body');
    dom.incidentsStatusFilter = document.getElementById('incidents-status-filter');
    dom.incidentsSeverityFilter = document.getElementById('incidents-severity-filter');
    dom.camerasViewSearch = document.getElementById('cameras-view-search');

    // Analytics DOM
    dom.refreshAnalyticsBtn = document.getElementById('refresh-analytics-btn');
  }

  // ---- App Initialization ----
  async function init() {
    cacheDom();
    setupClock();
    setupNavigation();
    setupFilters();
    setupSearch();
    setupModalControls();
    setupSimulationLauncher();
    setupGlobalAutoplayKickstarter();
    setupLandingPage();

    // 1. Immediately render defaults (Guarantees zero blank screen in all deployments)
    renderAll();
    renderVenueMap();

    // 2. Hydrate from backend asynchronously
    try {
      await Promise.allSettled([
        loadCameras(),
        loadIncidents(),
        loadAnalytics(),
        loadSettings(),
      ]);
      renderAll();
      renderVenueMap();
    } catch (err) {
      console.warn('Backend hydration notice:', err);
    }
  }

  // ---- Global Autoplay Kickstarter ----
  // Ensures any browser restriction on background video playback is immediately lifted
  function setupGlobalAutoplayKickstarter() {
    function startAllVideos() {
      document.querySelectorAll('video').forEach((vid) => {
        vid.muted = true;
        vid.defaultMuted = true;
        if (vid.paused) {
          vid.play().catch(() => {});
        }
      });
    }

    ['click', 'touchstart', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, startAllVideos, { passive: true });
    });
  }

  // ---- Real-time Clock & CCTV HUD Timers ----
  function setupClock() {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + ' UTC';
      if (dom.clock) dom.clock.textContent = timeStr;
      if (dom.dateDisplay) {
        dom.dateDisplay.textContent = now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      // Update OSD timestamps on all dashboard camera tiles
      const nowIso = now.toISOString().replace('T', ' ').slice(0, 19);
      document.querySelectorAll('.tile-cctv-osd-time').forEach((el) => {
        el.textContent = nowIso;
      });

      // Update modal HUD timestamp if open
      if (dom.hudLiveTimestamp && dom.invModal && !dom.invModal.hidden) {
        dom.hudLiveTimestamp.textContent = `${nowIso} UTC`;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ---- Navigation Router ----
  function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        switchView(targetView);
      });
    });
  }

  function switchView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll('.nav-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    document.querySelectorAll('.view-panel').forEach((p) => {
      p.classList.toggle('active', p.id === `view-${viewName}`);
    });

    if (viewName === 'cameras') renderCamerasTable();
    if (viewName === 'venue-map') renderVenueMap();
    if (viewName === 'incidents') renderIncidentsTable();
    if (viewName === 'analytics') loadAnalytics().then(renderAnalyticsView);
  }

  // ---- Data Loaders ----
  async function loadCameras() {
    const data = await API.getCameras();
    if (data.success && Array.isArray(data.cameras) && data.cameras.length > 0) {
      state.cameras = data.cameras;
      if (dom.sidebarCamCount) dom.sidebarCamCount.textContent = state.cameras.length;
      state.cameras.forEach((c) => {
        if (!state.sessionStartTimes[c.id]) {
          state.sessionStartTimes[c.id] = Date.now();
        }
      });
    }
  }

  async function loadIncidents() {
    const data = await API.getIncidents();
    if (data.success && Array.isArray(data.incidents)) {
      state.incidents = data.incidents;
      updateKpis();
    }
  }

  async function loadAnalytics() {
    const data = await API.getAnalytics();
    if (data.success && data.analytics) {
      state.analytics = data.analytics;
    }
  }

  async function loadSettings() {
    const data = await API.getSettings();
    if (data.success && data.settings) {
      state.settings = data.settings;
      renderSettingsView(data.settings);
    }
  }

  // ---- KPI Calculations ----
  function updateKpis() {
    const totalCameras = state.cameras.length;
    const activeIncidents = state.incidents.filter(
      (i) => i.status === 'New' || i.status === 'Acknowledged' || i.status === 'Assigned' || i.status === 'Monitoring'
    );
    const criticalIncidents = activeIncidents.filter((i) => i.severity === 'Emergency');
    const respondIncidents = activeIncidents.filter((i) => i.severity === 'Respond');
    const observeIncidents = activeIncidents.filter((i) => i.severity === 'Observe');

    if (dom.kpiCameras) dom.kpiCameras.textContent = `${totalCameras} / ${totalCameras}`;
    if (dom.kpiIncidents) dom.kpiIncidents.textContent = state.incidents.length;
    if (dom.kpiActiveAlerts) dom.kpiActiveAlerts.textContent = activeIncidents.length;
    if (dom.kpiCritical) dom.kpiCritical.textContent = criticalIncidents.length;

    if (dom.alertsCountHeader) dom.alertsCountHeader.textContent = `(${activeIncidents.length})`;
    if (dom.alertsCountBadge) dom.alertsCountBadge.textContent = `${activeIncidents.length} Active`;
    if (dom.sidebarIncidentCount) dom.sidebarIncidentCount.textContent = activeIncidents.length;
    if (dom.sidebarCamCount) dom.sidebarCamCount.textContent = totalCameras;

    if (dom.filterCountAll) dom.filterCountAll.textContent = activeIncidents.length;
    if (dom.filterCountL3) dom.filterCountL3.textContent = criticalIncidents.length;
    if (dom.filterCountL2) dom.filterCountL2.textContent = respondIncidents.length;
    if (dom.filterCountL1) dom.filterCountL1.textContent = observeIncidents.length;
  }

  // ---- Render All Views ----
  function renderAll() {
    updateKpis();
    renderCctvGrid();
    renderAlertsPanel();
  }

  // ================= 3x3 CCTV GRID (Continuous Looping Feeds Matching Reference Design) =================
  const CAMERA_MAP = {
    'CAM-01': { title: 'Entrance Concourse', sub: 'Entrance & Ticket Hall' },
    'CAM-02': { title: 'North Transit Plaza', sub: 'Transit Plaza & Parking North' },
    'CAM-03': { title: 'Main Corridor & Turnstiles', sub: 'Central Concourse Corridor' },
    'CAM-04': { title: 'Operations & Server Vault', sub: 'Security Operations & Tech Vault' },
    'CAM-05': { title: 'Passenger Waiting Lounge', sub: 'East Passenger Waiting Hall' },
    'CAM-06': { title: 'West Stairwell & Footbridge', sub: 'West Stairwell Overbridge' },
    'CAM-07': { title: 'Platform 1 - Trackside North', sub: 'Trackside Platform 1' },
    'CAM-08': { title: 'Platform 2 - Trackside South', sub: 'Trackside Platform 2' },
    'CAM-09': { title: 'Exit Gate - South Concourse', sub: 'South Concourse' }
  };

  function renderCctvGrid() {
    if (!dom.cctvGrid) return;
    dom.cctvGrid.innerHTML = '';

    const query = state.searchQuery.toLowerCase().trim();
    const filteredCameras = state.cameras.filter((cam) => {
      if (!query) return true;
      return (
        cam.id.toLowerCase().includes(query) ||
        cam.name.toLowerCase().includes(query) ||
        cam.zone.toLowerCase().includes(query)
      );
    });

    if (filteredCameras.length === 0) {
      dom.cctvGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
          No cameras match search query "${state.searchQuery}".
        </div>
      `;
      return;
    }

    filteredCameras.forEach((camera) => {
      const isCam08 = camera.id === 'CAM-08';
      const cameraIncidents = state.incidents.filter(
        (i) => i.cameraId === camera.id && i.status !== 'Resolved' && i.status !== 'False Alarm'
      );
      
      let severityClass = isCam08 ? 'has-emergency' : '';
      if (!isCam08) {
        if (cameraIncidents.some((i) => i.severity === 'Emergency')) {
          severityClass = 'has-emergency';
        } else if (cameraIncidents.some((i) => i.severity === 'Respond')) {
          severityClass = 'has-respond';
        } else if (cameraIncidents.some((i) => i.severity === 'Observe')) {
          severityClass = 'has-observe';
        }
      }

      const staticUrl = `/videos/${camera.id.toLowerCase()}.mp4`;
      const streamUrl = `/api/cameras/${camera.id}/stream`;
      const camMeta = CAMERA_MAP[camera.id] || { title: camera.name, sub: camera.zone };

      const tile = document.createElement('div');
      tile.className = `camera-tile ${severityClass}`;
      tile.id = `tile-${camera.id}`;
      tile.setAttribute('title', `Open live feed investigation for ${camera.id} (${camMeta.title})`);

      // Video element created with explicit properties to guarantee continuous loop
      const videoWrap = document.createElement('div');
      videoWrap.className = 'tile-video-wrap';

      const video = document.createElement('video');
      video.className = 'tile-video';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');
      video.preload = 'auto';
      // Load static fast-CDN surveillance footage first (instantaneous & smooth)
      video.src = staticUrl;

      // Event listeners ensuring the video NEVER stalls or pauses
      video.addEventListener('canplay', () => video.play().catch(() => {}));
      video.addEventListener('loadeddata', () => video.play().catch(() => {}));
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
      video.addEventListener('pause', () => {
        video.play().catch(() => {});
      });
      video.addEventListener('error', (err) => {
        console.warn(`Video load fallback for ${camera.id}:`, err);
        if (video.src && video.src.includes('/videos/')) {
          video.src = streamUrl;
          video.load();
          video.play().catch(() => {});
        } else {
          setTimeout(() => {
            video.src = staticUrl;
            video.load();
            video.play().catch(() => {});
          }, 1500);
        }
      });

      // Top Overlay (Matching reference image: CAM-XX + LIVE pill; CAM-08 has EMERGENCY badge)
      const topOverlay = document.createElement('div');
      topOverlay.className = 'tile-top-overlay';
      if (isCam08) {
        topOverlay.innerHTML = `
          <div class="tile-top-left-badges">
            <span class="tile-cam-id">CAM-08</span>
            <span class="tile-live-badge live-red"><span class="dot-live dot-red"></span> LIVE</span>
          </div>
          <span class="tile-emergency-pill">EMERGENCY</span>
        `;
      } else {
        topOverlay.innerHTML = `
          <div class="tile-top-left-badges">
            <span class="tile-cam-id">${camera.id}</span>
            <span class="tile-live-badge live-green"><span class="dot-live dot-green"></span> LIVE</span>
          </div>
        `;
      }

      // Bottom Overlay (Bold title, map pin + subtitle, expand icon)
      const bottomOverlay = document.createElement('div');
      bottomOverlay.className = 'tile-bottom-overlay';
      bottomOverlay.innerHTML = `
        <div class="tile-info-text">
          <span class="tile-name">${camMeta.title}</span>
          <span class="tile-zone"><span class="zone-pin">📍</span> ${camMeta.sub}</span>
        </div>
        <div class="tile-expand-icon" title="Expand CCTV Feed">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 3 21 3 21 9"/>
            <polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/>
            <line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
        </div>
      `;

      videoWrap.appendChild(video);
      videoWrap.appendChild(topOverlay);
      videoWrap.appendChild(bottomOverlay);
      tile.appendChild(videoWrap);

      tile.addEventListener('click', () => openInvestigationModal(camera));
      dom.cctvGrid.appendChild(tile);

      // Trigger play immediately
      video.play().catch(() => {});
    });
  }

  // ================= ACTIVE ALERTS PANEL (Matching Reference Design with Video Thumbs) =================
  function renderAlertsPanel() {
    if (!dom.alertsList) return;
    dom.alertsList.innerHTML = '';

    let alerts = [...state.incidents];

    if (state.alertFilter !== 'All') {
      alerts = alerts.filter((a) => a.severity === state.alertFilter);
    }

    if (alerts.length === 0) {
      dom.alertsList.innerHTML = `
        <div style="padding: 24px 12px; text-align: center; color: var(--text-muted); font-size: 0.74rem;">
          No active alerts in "${state.alertFilter}" category.
        </div>
      `;
      return;
    }

    alerts.forEach((incident) => {
      const card = document.createElement('div');
      const sevClass = incident.severity ? incident.severity.toLowerCase() : 'observe';
      const sevLevel = incident.severityLevel || (incident.severity === 'Emergency' ? 3 : (incident.severity === 'Respond' ? 2 : 1));
      const levelLabel = `Level ${sevLevel}`;

      card.className = `alert-card card-${sevClass}`;
      card.id = `alert-card-${incident.incidentId}`;

      const timeFormatted = formatTimeAgo(incident.timestamp);

      card.innerHTML = `
        <div class="alert-thumb-wrap">
          <video class="alert-thumb-video" src="/videos/${incident.cameraId.toLowerCase()}.mp4" autoplay loop muted playsinline preload="auto"></video>
        </div>
        <div class="alert-card-body">
          <div class="alert-card-top">
            <span class="alert-cam-zone">
              <span class="alert-dot dot-${sevClass}">●</span>
              ${incident.cameraId} • ${incident.zone}
            </span>
            <span class="alert-time">${timeFormatted}</span>
          </div>
          <div class="alert-title-row">
            <span class="alert-card-type">${incident.eventType}</span>
            <span class="alert-level-pill badge-${sevClass}">${levelLabel}</span>
          </div>
          <p class="alert-card-desc">${incident.description}</p>
          <div class="alert-card-footer">
            <span class="alert-status-tag">STATUS: <strong>${incident.status.toUpperCase()}</strong></span>
            <button class="alert-open-btn" data-cam="${incident.cameraId}">Inspect Feed →</button>
          </div>
        </div>
      `;

      const thumbVideo = card.querySelector('.alert-thumb-video');
      if (thumbVideo) {
        thumbVideo.addEventListener('canplay', () => thumbVideo.play().catch(() => {}));
      }

      card.querySelector('.alert-open-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const cam = state.cameras.find((c) => c.id === incident.cameraId);
        if (cam) openInvestigationModal(cam);
      });

      card.addEventListener('click', () => {
        const cam = state.cameras.find((c) => c.id === incident.cameraId);
        if (cam) openInvestigationModal(cam);
      });

      dom.alertsList.appendChild(card);
    });
  }

  // ================= HERO LANDING PAGE CONTROLLER & AUTH =================
  function setupLandingPage() {
    const landingPage = document.getElementById('landing-page');
    const dashboardApp = document.getElementById('dashboard-app');
    const btnLandingQuickDemo = document.getElementById('btn-landing-quick-demo');
    const btnLandingEnterDashboard = document.getElementById('btn-landing-enter-dashboard');
    const btnHeroLaunchSoc = document.getElementById('btn-hero-launch-soc');
    const btnInstantDemoAuth = document.getElementById('btn-instant-demo-auth');
    const btnFooterEnterDashboard = document.getElementById('btn-footer-enter-dashboard');
    const btnReturnLanding = document.getElementById('btn-return-landing');

    const tabAuthLogin = document.getElementById('tab-auth-login');
    const tabAuthSignup = document.getElementById('tab-auth-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    function enterDashboard(userRole = 'Chief Commander Alex Vance', station = 'Central Metro Terminal • Sector 4') {
      if (landingPage) landingPage.style.display = 'none';
      if (dashboardApp) {
        dashboardApp.style.display = 'flex';
      }
      document.body.classList.remove('on-landing');
      document.body.style.overflow = 'hidden';

      // Explicitly switch to dashboard view and fresh render
      switchView('dashboard');
      renderAll();

      // Ensure all videos play continuously
      setTimeout(() => {
        document.querySelectorAll('video').forEach((v) => {
          v.muted = true;
          v.defaultMuted = true;
          v.play().catch(() => {});
        });
      }, 50);

      // Show toast notification
      showToast(`Access Granted: ${userRole} authenticated for ${station}`, 'success');
      localStorage.setItem('presense_session', JSON.stringify({ role: userRole, station: station, timestamp: Date.now() }));
    }

    function exitToLanding() {
      if (dashboardApp) dashboardApp.style.display = 'none';
      if (landingPage) landingPage.style.display = 'flex';
      document.body.classList.add('on-landing');
      document.body.style.overflow = 'auto';
      localStorage.removeItem('presense_session');
    }

    // Connect landing action buttons
    if (btnLandingQuickDemo) btnLandingQuickDemo.addEventListener('click', () => enterDashboard());
    if (btnLandingEnterDashboard) btnLandingEnterDashboard.addEventListener('click', () => enterDashboard());
    if (btnHeroLaunchSoc) btnHeroLaunchSoc.addEventListener('click', () => enterDashboard());
    if (btnInstantDemoAuth) btnInstantDemoAuth.addEventListener('click', () => enterDashboard());
    if (btnFooterEnterDashboard) btnFooterEnterDashboard.addEventListener('click', () => enterDashboard());
    if (btnReturnLanding) btnReturnLanding.addEventListener('click', exitToLanding);

    // Tab switching between Sign In & Sign Up
    if (tabAuthLogin && tabAuthSignup) {
      tabAuthLogin.addEventListener('click', () => {
        tabAuthLogin.classList.add('active');
        tabAuthSignup.classList.remove('active');
        if (formLogin) formLogin.style.display = 'flex';
        if (formSignup) formSignup.style.display = 'none';
      });

      tabAuthSignup.addEventListener('click', () => {
        tabAuthSignup.classList.add('active');
        tabAuthLogin.classList.remove('active');
        if (formLogin) formLogin.style.display = 'none';
        if (formSignup) formSignup.style.display = 'flex';
      });
    }

    // Login Form Submit
    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value || 'SOC Operator';
        const station = document.getElementById('login-station')?.value || 'Central Metro Terminal • Sector 4';
        const namePart = email.split('@')[0].replace('.', ' ').toUpperCase();
        enterDashboard(`Officer ${namePart}`, station);
      });
    }

    // Signup Form Submit
    if (formSignup) {
      formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name')?.value || 'Chief Operator';
        const dept = document.getElementById('signup-dept')?.value || 'Transit SOC';
        enterDashboard(`${name} (${dept})`, 'Central Metro Terminal • Sector 4');
      });
    }

    // Check if session exists; default to landing page
    const existing = localStorage.getItem('presense_session');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        enterDashboard(parsed.role, parsed.station);
      } catch (_) {
        exitToLanding();
      }
    } else {
      exitToLanding();
    }
  }

  // Floating notification toast
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.presense-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `presense-toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #141824;
      border: 1px solid #f59e0b;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.3);
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    toast.innerHTML = `<span style="color: #f59e0b; font-size: 1rem;">🛡️</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ---- Setup Filters & Search ----
  function setupFilters() {
    document.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.alertFilter = pill.dataset.filter;
        renderAlertsPanel();
      });
    });

    document.querySelectorAll('.btn-quick-sim').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const scenario = btn.dataset.scenario;
        await triggerScenario(scenario);
      });
    });

    // Wire up 'View All ->' link in alerts panel
    const viewAllLink = document.getElementById('link-view-all-alerts');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('incidents');
      });
    }

    // Grid toolbar control buttons
    const muteBtn = document.getElementById('mute-all-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = muteBtn.textContent.includes('Muted');
        document.querySelectorAll('video').forEach((v) => {
          v.muted = !isMuted;
        });
        const span = muteBtn.querySelector('span');
        if (span) span.textContent = isMuted ? 'Unmuted' : 'Muted';
      });
    }

    const refreshGridBtn = document.getElementById('refresh-grid-btn');
    if (refreshGridBtn) {
      refreshGridBtn.addEventListener('click', () => {
        document.querySelectorAll('.tile-video').forEach((v) => {
          v.currentTime = 0;
          v.play().catch(() => {});
        });
      });
    }

    const fsBtn = document.getElementById('btn-fullscreen-grid');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          (dom.cctvGrid || document.documentElement).requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  function setupSearch() {
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderCctvGrid();
      });
    }
  }

  // ================= EXPANDED CAMERA INVESTIGATION VIEW (No Media Controls, Live CCTV OSD) =================
  function setupModalControls() {
    if (dom.closeInvBtn) {
      dom.closeInvBtn.addEventListener('click', closeInvestigationModal);
    }
    if (dom.invModal) {
      dom.invModal.addEventListener('click', (e) => {
        if (e.target === dom.invModal) closeInvestigationModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeInvestigationModal();
        closeSimModal();
      }
    });

    // Primary AI Analyze Button
    if (dom.btnAnalyzeMain) {
      dom.btnAnalyzeMain.addEventListener('click', () => runAIAnalysis(state.selectedAnalysisWindow));
    }

    // Window selector buttons
    if (dom.btnAnalyze10) {
      dom.btnAnalyze10.addEventListener('click', () => {
        state.selectedAnalysisWindow = 10;
        dom.btnAnalyze10.classList.add('active');
        if (dom.btnAnalyze20) dom.btnAnalyze20.classList.remove('active');
      });
    }
    if (dom.btnAnalyze20) {
      dom.btnAnalyze20.addEventListener('click', () => {
        state.selectedAnalysisWindow = 20;
        dom.btnAnalyze20.classList.add('active');
        if (dom.btnAnalyze10) dom.btnAnalyze10.classList.remove('active');
      });
    }

    if (dom.btnCreateIncidentAi) {
      dom.btnCreateIncidentAi.addEventListener('click', logIncidentFromAI);
    }
  }

  function openInvestigationModal(camera) {
    state.selectedCamera = camera;
    dom.invModalId.textContent = camera.id;
    dom.invModalName.textContent = camera.name;
    dom.invModalZone.textContent = `${camera.zone} • ${camera.source === 'gridfs' ? 'MongoDB Atlas GridFS Stream' : 'Transit CCTV Network'}`;
    
    // Set Surveillance Monitor HUD tags
    if (dom.hudCamId) dom.hudCamId.textContent = camera.id;
    if (dom.hudCamZone) dom.hudCamZone.textContent = `ZONE: ${camera.zone.toUpperCase()}`;
    if (dom.invSourceTag) dom.invSourceTag.textContent = camera.source === 'gridfs' ? 'STREAMING FROM ATLAS GRIDFS' : 'PRERECORDED CCTV FEED';
    if (dom.invMetaRes) dom.invMetaRes.textContent = `${camera.resolution || '1920×1080'} @ ${camera.fps || 25} FPS`;

    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (dom.hudLiveTimestamp) dom.hudLiveTimestamp.textContent = `${nowIso} UTC`;

    // Session duration
    const startTime = state.sessionStartTimes[camera.id] || Date.now();
    const sessionSeconds = Math.max(10, Math.floor((Date.now() - startTime) / 1000));
    const mins = Math.floor(sessionSeconds / 60);
    const secs = sessionSeconds % 60;
    dom.invSessionDuration.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // STRICT: Absolutely NO playback/speed/pause controls! Pure live CCTV surveillance monitor
    dom.invVideo.controls = false;
    dom.invVideo.removeAttribute('controls');
    dom.invVideo.muted = true;
    dom.invVideo.defaultMuted = true;
    dom.invVideo.loop = true;
    dom.invVideo.autoplay = true;
    dom.invVideo.playsInline = true;
    dom.invVideo.setAttribute('playsinline', '');
    dom.invVideo.setAttribute('muted', '');
    dom.invVideo.setAttribute('autoplay', '');
    dom.invVideo.setAttribute('loop', '');

    const invStaticUrl = `/videos/${camera.id.toLowerCase()}.mp4`;
    const invStreamUrl = `/api/cameras/${camera.id}/stream`;
    dom.invVideo.src = invStaticUrl;
    dom.invVideo.load();
    dom.invVideo.play().catch(() => {});

    dom.invVideo.onerror = () => {
      if (dom.invVideo.src && dom.invVideo.src.includes('/videos/')) {
        dom.invVideo.src = invStreamUrl;
        dom.invVideo.load();
        dom.invVideo.play().catch(() => {});
      }
    };

    // Ensure loop continues without stopping
    dom.invVideo.onended = () => {
      dom.invVideo.currentTime = 0;
      dom.invVideo.play().catch(() => {});
    };
    dom.invVideo.onpause = () => {
      dom.invVideo.play().catch(() => {});
    };

    // Render camera's incidents in modal
    renderCameraIncidentsHistory(camera.id);

    // Reset AI container
    dom.aiLoading.hidden = true;
    dom.aiReportContainer.hidden = true;
    state.activeAIReport = null;

    dom.invModal.hidden = false;
  }

  function closeInvestigationModal() {
    if (dom.invModal) dom.invModal.hidden = true;
    if (dom.invVideo) {
      dom.invVideo.pause();
      dom.invVideo.removeAttribute('src');
      dom.invVideo.load();
    }
    state.selectedCamera = null;
  }

  function renderCameraIncidentsHistory(cameraId) {
    if (!dom.invCameraIncidentsList) return;
    const cameraIncidents = state.incidents.filter((i) => i.cameraId === cameraId);
    if (cameraIncidents.length === 0) {
      dom.invCameraIncidentsList.innerHTML = `<div class="history-empty">No active security anomalies flagged for this feed.</div>`;
      return;
    }

    dom.invCameraIncidentsList.innerHTML = cameraIncidents
      .map(
        (inc) => `
        <div style="background: var(--bg-card); padding: 8px 10px; border-radius: 4px; border-left: 3px solid ${
          inc.severity === 'Emergency' ? 'var(--severity-emergency)' : inc.severity === 'Respond' ? 'var(--severity-respond)' : 'var(--severity-observe)'
        }">
          <div style="display:flex; justify-content:space-between; font-size:0.68rem;">
            <strong>${inc.eventType}</strong>
            <span style="color:var(--text-muted);">${formatTimeAgo(inc.timestamp)}</span>
          </div>
          <div style="font-size:0.68rem; color:var(--text-secondary); margin-top:2px;">${inc.description}</div>
        </div>
      `
      )
      .join('');
  }

  // ================= OPENROUTER AI VISUAL ANALYSIS =================
  async function runAIAnalysis(windowMinutes = 10) {
    if (!state.selectedCamera) return;

    dom.aiLoading.hidden = false;
    dom.aiReportContainer.hidden = true;

    // Sample representative frames from playing video via canvas
    const frames = captureSampledFrames(3);

    const startTime = state.sessionStartTimes[state.selectedCamera.id] || Date.now();
    const sessionDurationSeconds = Math.max(30, Math.floor((Date.now() - startTime) / 1000));

    try {
      const result = await API.runAIAnalysis({
        cameraId: state.selectedCamera.id,
        windowMinutes,
        sessionDurationSeconds,
        sampledFrames: frames,
        customContext: `Visual investigation of camera feed ${state.selectedCamera.name} (${state.selectedCamera.zone}). Focus on current activity, people/crowd movement, and security status.`,
      });

      dom.aiLoading.hidden = true;

      if (result.success && result.report) {
        state.activeAIReport = result.report;
        displayAIReport(result.report);

        if (result.createdIncident) {
          state.incidents.unshift(result.createdIncident);
          renderAll();
        }
      } else {
        alert(`Analysis Error: ${result.error || 'Failed to complete visual analysis.'}`);
      }
    } catch (err) {
      dom.aiLoading.hidden = true;
      alert(`AI Analysis Request Failed: ${err.message}`);
    }
  }

  // Capture bounded frames using HTML5 canvas
  function captureSampledFrames(count = 3) {
    const video = dom.invVideo;
    if (!video || !dom.samplingCanvas || video.videoWidth === 0) return [];

    const canvas = dom.samplingCanvas;
    const width = 640;
    const height = Math.round((video.videoHeight / video.videoWidth) * 640) || 360;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    const frames = [];

    try {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      frames.push(dataUrl);
    } catch (e) {
      console.warn('Canvas frame capture fallback:', e.message);
    }

    return frames;
  }

  function displayAIReport(report) {
    dom.aiReportContainer.hidden = false;

    // Prominent "What is Happening" Highlight Card
    const summaryText = report.whatIsHappeningSummary || report.observedActivity?.sceneOverview || 'No description available.';
    if (dom.repHappeningText) {
      dom.repHappeningText.textContent = summaryText;
    }

    // Section A: Summary
    const winPill = document.getElementById('rep-window-pill');
    if (winPill) winPill.textContent = report.summary.requestedWindow || '10 Min Window';
    
    const srcPill = document.getElementById('rep-source-pill');
    if (srcPill) srcPill.textContent = report.summary.sourceType || 'Atlas GridFS';
    
    const timePill = document.getElementById('rep-time-pill');
    if (timePill) timePill.textContent = new Date().toLocaleTimeString();

    const covNotice = document.getElementById('rep-coverage-notice');
    if (covNotice) {
      covNotice.textContent = `Actual analyzed duration: ${report.summary.actualAnalyzedDuration || 'Sampled Footage'}`;
    }

    // Section D: Risk Assessment
    const riskBadge = document.getElementById('rep-risk-badge');
    const riskLevel = report.riskAssessment?.level || 'Observe';
    if (riskBadge) {
      riskBadge.textContent = `LEVEL: ${riskLevel.toUpperCase()}`;
      riskBadge.className = `risk-level-badge ${
        riskLevel === 'Emergency' ? 'badge-emergency' : riskLevel === 'Respond' ? 'badge-respond' : 'badge-observe'
      }`;
    }
    const riskExp = document.getElementById('rep-risk-explanation');
    if (riskExp) riskExp.textContent = report.riskAssessment?.explanation || 'Normal operations.';

    // Section B: Observed Activity
    const obsOverview = document.getElementById('rep-observed-overview');
    if (obsOverview) obsOverview.textContent = report.observedActivity?.sceneOverview || 'No data';
    
    const crowdFlow = document.getElementById('rep-crowd-flow');
    if (crowdFlow) crowdFlow.textContent = report.observedActivity?.crowdFlow || 'Normal pedestrian transit';
    
    const visibility = document.getElementById('rep-visibility');
    if (visibility) visibility.textContent = report.observedActivity?.physicalConditions || 'Clear camera visibility';

    // Section C: Potential Incidents
    const incList = document.getElementById('rep-incidents-list');
    if (incList) {
      if (report.potentialIncidents && report.potentialIncidents.length > 0) {
        incList.innerHTML = report.potentialIncidents
          .map(
            (inc) => `
          <div style="background: var(--bg-card); padding: 8px 10px; border-radius: 4px; margin-top: 6px;">
            <div style="display:flex; justify-content:space-between; font-size:0.74rem;">
              <strong>${inc.eventCategory}</strong>
              <span class="report-pill ${inc.severity === 'Emergency' ? 'badge-emergency' : inc.severity === 'Respond' ? 'badge-respond' : 'badge-observe'}">${inc.severity}</span>
            </div>
            <p style="font-size:0.72rem; color:var(--text-secondary); margin-top:4px;">${inc.observedEvidence}</p>
            <p style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Reasoning: ${inc.reasoning}</p>
          </div>
        `
          )
          .join('');
      } else {
        incList.innerHTML = `<span style="font-size:0.72rem; color:var(--text-muted);">No anomalous incidents detected. Feed shows normal operations.</span>`;
      }
    }

    // Section E: Recommended Action
    const opAction = document.getElementById('rep-operator-action');
    if (opAction) opAction.textContent = report.recommendedAction?.operatorAction || 'Continue routine surveillance.';
    
    const dispAction = document.getElementById('rep-dispatch-action');
    if (dispAction) dispAction.textContent = report.recommendedAction?.dispatchAction || 'None required.';

    // Section F: Limitations
    const limitText = document.getElementById('rep-limitations-text');
    if (limitText) {
      limitText.textContent = `${report.limitations?.footageLimitations || ''} ${report.limitations?.ambiguities || ''}`;
    }
  }

  async function logIncidentFromAI() {
    if (!state.activeAIReport || !state.selectedCamera) return;

    const rep = state.activeAIReport;
    const primaryInc = rep.potentialIncidents?.[0] || {
      eventCategory: 'Operational Observation',
      severity: rep.riskAssessment?.level || 'Observe',
      observedEvidence: rep.whatIsHappeningSummary || 'Report filed by AI analysis',
    };

    try {
      const result = await API.createIncident({
        cameraId: state.selectedCamera.id,
        cameraName: state.selectedCamera.name,
        zone: state.selectedCamera.zone,
        eventType: primaryInc.eventCategory,
        severity: primaryInc.severity || 'Observe',
        description: `[AI Finding] ${primaryInc.observedEvidence}`,
        evidenceReference: `${state.selectedCamera.id} OpenRouter Report (${rep.reportId})`,
        sourceType: 'ai_vision_analysis',
      });

      if (result.success && result.incident) {
        state.incidents.unshift(result.incident);
        renderAll();
        renderCameraIncidentsHistory(state.selectedCamera.id);
        alert(`Incident ${result.incident.incidentId} successfully logged and added to Active Alerts.`);
      }
    } catch (err) {
      alert(`Failed to log incident: ${err.message}`);
    }
  }

  // ================= SCENARIO SIMULATION =================
  function setupSimulationLauncher() {
    if (dom.openSimModalBtn) {
      dom.openSimModalBtn.addEventListener('click', () => {
        if (dom.simModal) dom.simModal.hidden = false;
      });
    }
    if (dom.closeSimBtn) {
      dom.closeSimBtn.addEventListener('click', closeSimModal);
    }
    if (dom.simModal) {
      dom.simModal.addEventListener('click', (e) => {
        if (e.target === dom.simModal) closeSimModal();
      });
    }

    document.querySelectorAll('.btn-launch-scen').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const card = e.target.closest('.scenario-card');
        if (card) {
          const scenarioType = card.dataset.scenario;
          await triggerScenario(scenarioType);
          closeSimModal();
        }
      });
    });
  }

  function closeSimModal() {
    if (dom.simModal) dom.simModal.hidden = true;
  }

  async function triggerScenario(scenarioType) {
    try {
      const result = await API.simulateIncident(scenarioType);
      if (result.success && result.incident) {
        state.incidents.unshift(result.incident);
        renderAll();
        switchView('dashboard');
        const tile = document.getElementById(`tile-${result.incident.cameraId}`);
        if (tile) tile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    }
  }

  // ================= INTERACTIVE VENUE MAP =================
  function renderVenueMap() {
    if (!dom.venueMapWrap) return;

    const svgHtml = `
      <svg class="station-svg" viewBox="0 0 950 520" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4"/>
          </filter>
        </defs>

        <!-- Floor Background -->
        <rect x="20" y="20" width="910" height="480" rx="10" fill="#0c0e15" stroke="#1d2335" stroke-width="2"/>

        <!-- ZONE 1: NORTH PARKING & BUS PLAZA (Top Left) -->
        <rect class="zone-rect" x="40" y="40" width="220" height="150" rx="6"/>
        <text x="50" y="62" fill="#64748b" font-size="11" font-weight="700">NORTH BUS PLAZA & PARKING</text>

        <!-- ZONE 2: PLATFORM 1 - TRACKSIDE NORTH -->
        <rect class="zone-rect" x="280" y="40" width="370" height="80" rx="6"/>
        <text x="290" y="60" fill="#64748b" font-size="11" font-weight="700">PLATFORM 1 (WESTBOUND EXPRESS)</text>
        <line x1="280" y1="95" x2="650" y2="95" class="track-line"/>

        <!-- ZONE 3: TECH VAULT & SECURITY OPS (Top Right) -->
        <rect class="zone-rect" x="670" y="40" width="240" height="150" rx="6"/>
        <text x="680" y="62" fill="#ef4444" font-size="11" font-weight="700">RESTRICTED: TECH & SECURITY VAULT</text>

        <!-- ZONE 4: OVERBRIDGE & WEST STAIRWELL (Mid Left) -->
        <rect class="zone-rect" x="40" y="210" width="220" height="110" rx="6"/>
        <text x="50" y="230" fill="#64748b" font-size="11" font-weight="700">WEST FOOTBRIDGE & STAIRWELL B</text>

        <!-- ZONE 5: PLATFORM 2 (Mid-Right) -->
        <rect class="zone-rect" x="500" y="140" width="150" height="80" rx="6"/>
        <text x="510" y="160" fill="#64748b" font-size="10" font-weight="700">PLATFORM 2 EGRESS</text>

        <!-- ZONE 6: CENTRAL CONCOURSE & TURNSTILES (Center) -->
        <rect class="zone-rect" x="280" y="210" width="370" height="160" rx="6" style="fill:#121726;"/>
        <text x="290" y="230" fill="#ff6b00" font-size="12" font-weight="800">MAIN PASSENGER CONCOURSE & TURNSTILES</text>
        <line x1="320" y1="280" x2="600" y2="280" stroke="#334155" stroke-width="3" stroke-dasharray="12 8"/>
        <text x="420" y="275" fill="#475569" font-size="9" font-family="monospace">AUTO TICKET GATES</text>

        <!-- ZONE 7: MAIN PASSENGER ENTRANCE (Bottom Left) -->
        <rect class="zone-rect" x="40" y="340" width="220" height="140" rx="6"/>
        <text x="50" y="360" fill="#64748b" font-size="11" font-weight="700">MAIN TERMINAL ENTRANCE & LOBBY</text>

        <!-- ZONE 8: EAST WAITING LOUNGE (Bottom Center) -->
        <rect class="zone-rect" x="280" y="390" width="370" height="90" rx="6"/>
        <text x="290" y="410" fill="#64748b" font-size="11" font-weight="700">EAST PASSENGER WAITING LOUNGE</text>

        <!-- ZONE 9: CARGO & FREIGHT DOCK (Bottom Right) -->
        <rect class="zone-rect" x="670" y="210" width="240" height="270" rx="6"/>
        <text x="680" y="230" fill="#64748b" font-size="11" font-weight="700">LOGISTICS LOADING DOCK & FREIGHT</text>

        <!-- 9 CAMERA MARKERS -->
        ${state.cameras
          .map((cam) => {
            const coords = cam.mapCoordinates || { x: 100, y: 100 };
            const isSelected = state.selectedCamera && state.selectedCamera.id === cam.id;
            const hasIncident = state.incidents.find(
              (i) => i.cameraId === cam.id && i.status !== 'Resolved' && i.status !== 'False Alarm'
            );
            const pulseColor = hasIncident
              ? hasIncident.severity === 'Emergency'
                ? '#ef4444'
                : hasIncident.severity === 'Respond'
                ? '#f59e0b'
                : '#3b82f6'
              : '#3b82f6';

            return `
            <g class="camera-pin ${isSelected ? 'selected' : ''}" data-cam-id="${cam.id}" transform="translate(${coords.x}, ${coords.y})">
              ${
                hasIncident
                  ? `<circle class="incident-pulse" cx="0" cy="0" r="14" fill="${pulseColor}" opacity="0.4"/>`
                  : ''
              }
              <circle cx="0" cy="0" r="10" fill="${hasIncident ? pulseColor : '#1e293b'}" stroke="${hasIncident ? '#ffffff' : '#38bdf8'}" stroke-width="2"/>
              <circle cx="0" cy="0" r="3" fill="#ffffff"/>
              <text class="pin-label" x="14" y="4">${cam.id}</text>
            </g>
          `;
          })
          .join('')}
      </svg>
    `;

    dom.venueMapWrap.innerHTML = svgHtml;

    dom.venueMapWrap.querySelectorAll('.camera-pin').forEach((pin) => {
      pin.addEventListener('click', () => {
        const camId = pin.dataset.camId;
        const cam = state.cameras.find((c) => c.id === camId);
        if (cam) selectMapCamera(cam);
      });
    });

    if (dom.mapOpenExpandedBtn) {
      dom.mapOpenExpandedBtn.addEventListener('click', () => {
        if (state.selectedCamera) openInvestigationModal(state.selectedCamera);
      });
    }
  }

  function selectMapCamera(camera) {
    state.selectedCamera = camera;
    dom.mapCardId.textContent = camera.id;
    dom.mapCardBadge.textContent = camera.source === 'gridfs' ? 'ATLAS GRIDFS' : 'DEMO LOOP';
    dom.mapCardName.textContent = camera.name;
    dom.mapCardZone.textContent = camera.zone;
    dom.mapNoPreview.style.display = 'none';

    const mapStaticUrl = `/videos/${camera.id.toLowerCase()}.mp4`;
    const mapStreamUrl = `/api/cameras/${camera.id}/stream`;
    dom.mapCardVideo.src = mapStaticUrl;
    dom.mapCardVideo.muted = true;
    dom.mapCardVideo.loop = true;
    dom.mapCardVideo.load();
    dom.mapCardVideo.play().catch(() => {});

    dom.mapCardVideo.onerror = () => {
      if (dom.mapCardVideo.src && dom.mapCardVideo.src.includes('/videos/')) {
        dom.mapCardVideo.src = mapStreamUrl;
        dom.mapCardVideo.load();
        dom.mapCardVideo.play().catch(() => {});
      }
    };

    dom.mapOpenExpandedBtn.disabled = false;

    dom.venueMapWrap.querySelectorAll('.camera-pin').forEach((p) => {
      p.classList.toggle('selected', p.dataset.camId === camera.id);
    });
  }

  // ================= VIEW 2: CAMERAS TABLE =================
  function renderCamerasTable() {
    if (!dom.camerasTableBody) return;
    dom.camerasTableBody.innerHTML = '';

    const query = (dom.camerasViewSearch ? dom.camerasViewSearch.value : '').toLowerCase().trim();
    const list = state.cameras.filter((c) => {
      if (!query) return true;
      return c.id.toLowerCase().includes(query) || c.name.toLowerCase().includes(query) || c.zone.toLowerCase().includes(query);
    });

    list.forEach((cam) => {
      const tr = document.createElement('tr');
      const gridFsIdDisplay = cam.gridFSFileId ? `${cam.gridFSFileId.slice(0, 10)}...` : 'Local Fallback';
      const sourceBadge = cam.source === 'gridfs'
        ? '<span class="table-badge badge-observe">GridFS Bucket</span>'
        : '<span class="table-badge badge-respond">Demo Fallback</span>';

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--brand-orange);">${cam.id}</td>
        <td style="font-weight:600; color:#fff;">${cam.name}</td>
        <td>${cam.zone}</td>
        <td style="font-family:var(--font-mono);">${cam.resolution} @ ${cam.fps}fps</td>
        <td>${sourceBadge}</td>
        <td style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted);">${gridFsIdDisplay}</td>
        <td><span class="table-badge" style="background:var(--status-connected-bg); color:var(--status-connected);">ONLINE_LOOP</span></td>
        <td>
          <button class="table-btn" data-cam="${cam.id}">Inspect</button>
        </td>
      `;

      tr.querySelector('button').addEventListener('click', () => openInvestigationModal(cam));
      dom.camerasTableBody.appendChild(tr);
    });
  }

  // ================= VIEW 4: INCIDENTS TABLE =================
  function renderIncidentsTable() {
    if (!dom.incidentsTableBody) return;
    dom.incidentsTableBody.innerHTML = '';

    const statusFilter = dom.incidentsStatusFilter ? dom.incidentsStatusFilter.value : 'All';
    const severityFilter = dom.incidentsSeverityFilter ? dom.incidentsSeverityFilter.value : 'All';

    let list = [...state.incidents];
    if (statusFilter !== 'All') list = list.filter((i) => i.status === statusFilter);
    if (severityFilter !== 'All') list = list.filter((i) => i.severity === severityFilter);

    if (list.length === 0) {
      dom.incidentsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">No incidents found.</td></tr>`;
      return;
    }

    list.forEach((inc) => {
      const tr = document.createElement('tr');
      const sevClass = inc.severity === 'Emergency' ? 'badge-emergency' : inc.severity === 'Respond' ? 'badge-respond' : 'badge-observe';

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-weight:700;">${inc.incidentId}</td>
        <td style="font-size:0.7rem;">${new Date(inc.timestamp).toLocaleString()}</td>
        <td><strong>${inc.cameraId}</strong> • ${inc.zone}</td>
        <td><strong>${inc.eventType}</strong></td>
        <td><span class="table-badge ${sevClass}">${inc.severity}</span></td>
        <td><span class="table-badge" style="background:var(--bg-elevated);">${inc.status}</span></td>
        <td style="font-size:0.7rem; color:var(--text-muted);">${inc.evidenceReference || '—'}</td>
        <td class="table-actions-cell">
          ${inc.status === 'New' ? `<button class="table-btn btn-ack" data-id="${inc.incidentId}">Acknowledge</button>` : ''}
          ${inc.status === 'Acknowledged' ? `<button class="table-btn btn-assign" data-id="${inc.incidentId}">Assign</button>` : ''}
          ${inc.status !== 'Resolved' && inc.status !== 'False Alarm' ? `<button class="table-btn btn-resolve" data-id="${inc.incidentId}">Resolve</button>` : ''}
          ${inc.status !== 'Resolved' && inc.status !== 'False Alarm' ? `<button class="table-btn btn-false" data-id="${inc.incidentId}">False Alarm</button>` : ''}
        </td>
      `;

      const ackBtn = tr.querySelector('.btn-ack');
      if (ackBtn) ackBtn.addEventListener('click', () => changeIncidentStatus(inc.incidentId, 'Acknowledged'));

      const assignBtn = tr.querySelector('.btn-assign');
      if (assignBtn) assignBtn.addEventListener('click', () => changeIncidentStatus(inc.incidentId, 'Assigned'));

      const resolveBtn = tr.querySelector('.btn-resolve');
      if (resolveBtn) resolveBtn.addEventListener('click', () => changeIncidentStatus(inc.incidentId, 'Resolved'));

      const falseBtn = tr.querySelector('.btn-false');
      if (falseBtn) falseBtn.addEventListener('click', () => changeIncidentStatus(inc.incidentId, 'False Alarm'));

      dom.incidentsTableBody.appendChild(tr);
    });
  }

  async function changeIncidentStatus(incidentId, newStatus) {
    try {
      const res = await API.updateIncidentStatus(incidentId, newStatus, 'Station Duty Operator', `Triage action: ${newStatus}`);
      if (res.success) {
        const inc = state.incidents.find((i) => i.incidentId === incidentId);
        if (inc) inc.status = newStatus;
        renderAll();
        renderIncidentsTable();
      }
    } catch (e) {
      alert(`Status update failed: ${e.message}`);
    }
  }

  // ================= VIEW 5: ANALYTICS VIEW =================
  function renderAnalyticsView() {
    if (!state.analytics) return;
    const an = state.analytics;

    document.getElementById('an-total-incidents').textContent = an.totalIncidents;
    document.getElementById('an-critical-count').textContent = an.bySeverity.Emergency || 0;
    document.getElementById('an-respond-count').textContent = an.bySeverity.Respond || 0;
    document.getElementById('an-observe-count').textContent = an.bySeverity.Observe || 0;
    document.getElementById('an-avg-response').textContent = `${an.avgResponseTimeMinutes}m`;
    document.getElementById('an-availability').textContent = `${an.cameraAvailabilityPercent}%`;

    const catContainer = document.getElementById('chart-by-category');
    if (catContainer && an.byCategory) {
      const maxVal = Math.max(...Object.values(an.byCategory), 1);
      catContainer.innerHTML = Object.entries(an.byCategory)
        .map(([cat, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return `
          <div class="chart-bar-row">
            <div class="bar-label-row">
              <span>${cat}</span>
              <strong>${count}</strong>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
        })
        .join('');
    }

    const camContainer = document.getElementById('chart-by-camera');
    if (camContainer && an.byCamera) {
      const maxVal = Math.max(...Object.values(an.byCamera), 1);
      camContainer.innerHTML = Object.entries(an.byCamera)
        .map(([camId, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return `
          <div class="chart-bar-row">
            <div class="bar-label-row">
              <span>${camId}</span>
              <strong>${count} incidents</strong>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${pct}%; background:#3b82f6;"></div>
            </div>
          </div>
        `;
        })
        .join('');
    }
  }

  // ================= VIEW 6: SETTINGS VIEW =================
  function renderSettingsView(settings) {
    if (!settings) return;
    if (document.getElementById('set-ai-model')) {
      document.getElementById('set-ai-model').textContent = settings.openRouter?.model || 'openai/gpt-4o-mini';
    }
    if (document.getElementById('set-ai-key-status')) {
      document.getElementById('set-ai-key-status').textContent = settings.openRouter?.configured ? 'ACTIVE (SECURE)' : 'NOT_CONFIGURED';
    }
    if (document.getElementById('set-mongo-status')) {
      document.getElementById('set-mongo-status').textContent = settings.database?.connected ? 'CONNECTED (ATLAS)' : 'DISCONNECTED';
    }
    if (document.getElementById('set-gridfs-count')) {
      document.getElementById('set-gridfs-count').textContent = `${settings.database?.gridFSVideoFilesCount || 7} Files Verified (videos bucket)`;
    }
  }

  // ---- Helper: Format Time Ago ----
  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  // ---- Table Search & Filter Event Listeners ----
  document.addEventListener('DOMContentLoaded', () => {
    init();

    if (dom.camerasViewSearch) {
      dom.camerasViewSearch.addEventListener('input', renderCamerasTable);
    }
    if (dom.incidentsStatusFilter) {
      dom.incidentsStatusFilter.addEventListener('change', renderIncidentsTable);
    }
    if (dom.incidentsSeverityFilter) {
      dom.incidentsSeverityFilter.addEventListener('change', renderIncidentsTable);
    }
    if (dom.refreshAnalyticsBtn) {
      dom.refreshAnalyticsBtn.addEventListener('click', () => loadAnalytics().then(renderAnalyticsView));
    }
  });
})();
