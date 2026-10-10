# PreSense — AI-Powered CCTV Monitoring & Rapid Crisis Response Dashboard

PreSense is an interactive, hackathon-ready prototype of an AI-assisted Security Operations Center (SOC) dashboard designed for high-density public transit hubs (railway stations, metro terminals, bus interchanges).

The prototype features **nine CCTV video feeds streamed from MongoDB Atlas GridFS**, **OpenRouter-powered visual analysis**, an **interactive SVG venue map**, **real-time incident alert workflows**, and a **three-level crisis classification system**.

---

## 🏗️ Architecture Overview

```
PRESENSE/
├── backend/
│   ├── config/
│   │   └── cameras.js          # Central mapping of CAM-01..09 to GridFS file IDs & map coordinates
│   ├── db/
│   │   ├── connection.js       # Reusable MongoDB Atlas & GridFSBucket connection singleton
│   │   └── repositories.js     # Resilient incident, report, and analytics data layer
│   ├── routes/
│   │   ├── cameras.js          # Camera directory, status, and HTTP 206 Range video streaming
│   │   ├── incidents.js        # Incident lifecycle (Acknowledge, Assign, Resolve) & simulation
│   │   ├── analysis.js         # OpenRouter AI visual analysis endpoint & report management
│   │   ├── analytics.js        # Dynamic operational safety metrics
│   │   └── settings.js         # Redacted system configuration and health checks
│   ├── services/
│   │   └── aiAnalysis.js       # Ethical OpenRouter vision analysis (Sections A-F report)
│   ├── server.js               # Express server with static frontend serving
│   └── .env                    # Environment variables (MONGODB_URI, OPENROUTER_API_KEY)
├── frontend/
│   ├── index.html              # Dark surveillance center SOC interface
│   ├── css/
│   │   └── styles.css          # Professional dark-mode design (Inter + JetBrains Mono)
│   └── js/
│       └── app.js              # Complete frontend controller
└── README.md
```

---

## 📹 Video Storage & GridFS Mapping

All nine video files are preserved without re-encoding, renaming, or modification. 

| Camera ID | Display Name | Station Zone | Resolution | GridFS File Reference | Source Type |
|---|---|---|---|---|---|
| **CAM-01** | Entrance Concourse Cam 1 | Entrance & Ticket Hall | 1920×1080 @ 25fps | `6aca5f2468d3d1710352f481` | MongoDB Atlas GridFS |
| **CAM-02** | North Transit Plaza Cam 2 | Transit Plaza & Parking North | 3840×2160 @ 30fps | `6aca5f2668d3d1710352f4a8` | MongoDB Atlas GridFS |
| **CAM-03** | Main Corridor & Turnstiles Cam 3 | Central Concourse Corridor | 3840×2160 @ 24fps | `6aca5f3968d3d1710352f611` | MongoDB Atlas GridFS |
| **CAM-04** | Operations & Server Vault Cam 4 | Security Operations & Tech Vault | 3840×2160 @ 24fps | `6aca5f4668d3d1710352f6ff` | MongoDB Atlas GridFS |
| **CAM-05** | Passenger Waiting Lounge Cam 5 | East Passenger Waiting Hall | 3840×2160 @ 30fps | `6aca5f5368d3d1710352f7fe` | MongoDB Atlas GridFS |
| **CAM-06** | West Stairwell & Footbridge Cam 6 | West Stairwell Overbridge | 2160×3840 @ 24fps | `6aca5f5868d3d1710352f855` | MongoDB Atlas GridFS |
| **CAM-07** | Logistics & Loading Dock Cam 7 | Logistics Loading Bay & Cargo | 2160×3840 @ 30fps | `6aca5f6368d3d1710352f929` | MongoDB Atlas GridFS |
| **CAM-08** | Platform 1 Track Overlook Cam 8 | Platform 1 - Trackside North | 2160×3840 @ 60fps | Local Stream Fallback | Prerecorded Demo Stream |
| **CAM-09** | Emergency Track Access Gate Cam 9 | Platform 2 - Emergency Exit Gate | 2160×3840 @ 60fps | Local Stream Fallback | Prerecorded Demo Stream |

> **Note on Storage Quota**: MongoDB Atlas Free Tier (M0 Sandbox) has a 512 MB hard storage cap. CAM-01 through CAM-07 (372 MB raw video) are stored directly in Atlas GridFS. To prevent write lockouts, CAM-08 and CAM-09 stream via the local fallback layer using the exact same HTTP 206 Partial Content range streaming engine.

---

## 🚦 Three-Level Crisis Classification

PreSense categorizes situational anomalies into three operational levels:

- **Level 1: OBSERVE (Blue)**
  - *Examples*: Unusual crowd density, stationary luggage (>10m), general loitering.
  - *Action*: Informational observation requiring operator review.
- **Level 2: RESPOND (Amber)**
  - *Examples*: Physical disputes, unauthorized access into buffer zones, escalator crowding bottlenecks.
  - *Action*: Elevated alert requiring priority operator verification and potential field team dispatch.
- **Level 3: EMERGENCY (Red)**
  - *Examples*: Person descending onto train tracks, medical collapse, platform-edge hazard.
  - *Action*: Immediate life-safety emergency alert with emergency team dispatch protocol and red camera highlighting.

---

## 🤖 OpenRouter AI Visual Analysis

Operators can click any camera feed to open the **Expanded Camera Investigation View** and select:
- **Analyze Last 10 Minutes**
- **Analyze Last 20 Minutes**

### Analysis Pipeline:
1. Samples representative video frames from the HTML5 video player via an offscreen `<canvas>`.
2. Calculates active viewing session duration vs requested window.
3. Transmits bounded frames to OpenRouter vision (`openai/gpt-4o-mini`).
4. Generates a structured JSON report covering:
   - **Section A**: Summary (Camera ID, zone, requested window, actual analyzed duration, source).
   - **Section B**: Observed physical activity (scene overview, crowd flow, environmental conditions).
   - **Section C**: Potential incidents (category, severity level 1-3, confidence, evidence reasoning).
   - **Section D**: Risk assessment (severity, operator verification requirement).
   - **Section E**: Recommended action (operator verification, field dispatch).
   - **Section F**: Limitations (session duration constraints, frame ambiguities).
5. **Strict Ethical Guardrails**:
   - Analyzes observable behavior only.
   - Never infers criminal intent, dangerousness, or moral character from appearance, clothing, race, or age.
   - Wearing masks or sunglasses is treated as normal transit behavior.

---

## 🗺️ Interactive Venue Map

The **Venue Map** view provides an interactive SVG blueprint of Central Metro Terminal:
- Highlights all 9 CCTV camera locations with directional coverage cones.
- Displays pulsing incident pins for active emergencies and alerts.
- Clicking any camera pin immediately previews the camera stream and allows opening the full investigation player.

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or later)
- Active MongoDB Atlas cluster
- OpenRouter API key

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create or verify `backend/.env`:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=PRESENSECLUSTER
DB_NAME=presense

# Server Port
PORT=3000

# OpenRouter Vision API
OPENROUTER_API_KEY=sk-or-v1-YOUR_OPENROUTER_KEY_HERE
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### 3. Start the Application
```bash
cd backend
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing the Prototype

Run the automated test suite:
```bash
node -e "require('./testSuite.js')" # or run individual curl tests
```

### Manual Testing Scenarios:
1. **Camera Search**: Type `CAM-03` or `Concourse` in the top search bar to filter tiles.
2. **Scenario Launcher**: Click **Simulate Demo Incident** in the top bar and launch:
   - *Person in Track Clearance Zone* (CAM-08) -> Triggers Level 3 Emergency red alert border.
   - *Critical Infrastructure Breach* (CAM-04) -> Triggers Level 2 Respond amber alert border.
3. **AI Investigation**: Click CAM-03, click **Analyze Last 10 Minutes**, and review the generated evidence report.
4. **Incident Triage**: Go to **Incidents** in the sidebar, view the audit trail, and click **Acknowledge** or **Resolve**.

---

## 🔒 Security & Privacy Notice
- Video feeds are simulated demonstrations using prerecorded clips.
- All credentials (`MONGODB_URI`, `OPENROUTER_API_KEY`) are managed exclusively in backend environment variables and are never transmitted to frontend clients.
