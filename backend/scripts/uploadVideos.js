/**
 * Upload the 9 video files to MongoDB Atlas GridFS.
 *
 * Run: npm run upload (from backend/)
 *
 * IMPORTANT: Videos are located at the PROJECT ROOT (../), not in backend/.
 * Each file is stored in GridFS with metadata containing the camera ID,
 * original filename, and content type.
 *
 * Skips files that are already uploaded (idempotent).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, closeDB, getBucket } = require('../db/connection');
const { CAMERAS } = require('../config/cameras');

// Videos live at the project root, one level up from backend/
const VIDEO_ROOT = path.resolve(__dirname, '..', '..');

async function uploadVideos() {
  console.log('🎬 PreSense Video Upload Script');
  console.log('================================\n');

  // Step 1: Test connection first
  console.log('Step 1: Testing MongoDB Atlas connection...');
  let db;
  try {
    const conn = await connectDB();
    db = conn.db;
  } catch (err) {
    console.error(`\n❌ Cannot connect to MongoDB Atlas: ${err.message}`);
    console.error('   Please check your backend/.env configuration.\n');
    process.exit(1);
  }

  const bucket = getBucket();

  // Step 2: Clean any orphaned chunks from previous interrupted uploads
  console.log('\nStep 2: Cleaning orphaned chunks...');
  const fileIds = (await db.collection('videos.files').find({}).project({ _id: 1 }).toArray()).map((f) => f._id);
  const orphanResult = await db.collection('videos.chunks').deleteMany({ files_id: { $nin: fileIds } });
  if (orphanResult.deletedCount > 0) {
    console.log(`   🧹 Cleaned ${orphanResult.deletedCount} orphaned chunks.`);
  } else {
    console.log('   ✨ No orphaned chunks found.');
  }

  // Step 3: Check which files already exist in GridFS
  console.log('\nStep 3: Checking existing uploads...');
  const existingFiles = await db
    .collection('videos.files')
    .find({})
    .project({ filename: 1, 'metadata.cameraId': 1 })
    .toArray();

  const existingMap = new Map(existingFiles.map((f) => [f.filename, f.metadata?.cameraId]));

  // Step 4: Upload each video
  console.log('\nStep 4: Uploading videos to GridFS...\n');

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let quotaReached = false;

  for (const camera of CAMERAS) {
    const filePath = path.join(VIDEO_ROOT, camera.filename);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      console.error(`   ❌ ${camera.id}: File not found at ${filePath}`);
      failed++;
      continue;
    }

    // Skip if already uploaded
    if (existingMap.has(camera.filename)) {
      console.log(`   ⏭️  ${camera.id}: "${camera.filename}" already uploaded in GridFS — skipping.`);
      skipped++;
      continue;
    }

    if (quotaReached) {
      console.log(`   ⚠️  ${camera.id}: Skipped due to Atlas 512 MB free tier quota limit. (Supported via local fallback stream)`);
      failed++;
      continue;
    }

    // Upload
    const fileSize = fs.statSync(filePath).size;
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
    console.log(`   ⬆️  ${camera.id}: Uploading "${camera.filename}" (${sizeMB} MB)...`);

    try {
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath);
        const uploadStream = bucket.openUploadStream(camera.filename, {
          contentType: 'video/mp4',
          metadata: {
            cameraId: camera.id,
            cameraName: camera.name,
            resolution: camera.resolution,
            fps: camera.fps,
            location: camera.location,
            originalFilename: camera.filename,
            uploadedAt: new Date().toISOString(),
          },
        });

        readStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
          console.log(`   ✅ ${camera.id}: Upload complete.`);
          resolve();
        });

        uploadStream.on('error', (err) => {
          if (err.message && err.message.includes('over your space quota')) {
            quotaReached = true;
            console.error(`   ⚠️  ${camera.id}: Atlas free tier 512 MB storage limit reached.`);
          } else {
            console.error(`   ❌ ${camera.id}: Upload failed — ${err.message}`);
          }
          reject(err);
        });

        readStream.on('error', (err) => {
          console.error(`   ❌ ${camera.id}: Read failed — ${err.message}`);
          reject(err);
        });
      });

      uploaded++;
    } catch {
      failed++;
    }
  }

  // Clean any remaining orphaned chunks if an upload was interrupted
  const finalFileIds = (await db.collection('videos.files').find({}).project({ _id: 1 }).toArray()).map((f) => f._id);
  await db.collection('videos.chunks').deleteMany({ files_id: { $nin: finalFileIds } });

  // Summary
  console.log('\n================================');
  console.log(`📊 Upload Summary: ${uploaded} uploaded, ${skipped} skipped, ${failed} unuploaded`);
  if (quotaReached) {
    console.log(`ℹ️  Note: MongoDB Atlas Free Tier (M0 Sandbox) has a 512 MB hard storage cap.`);
    console.log(`   The PreSense API automatically streams non-uploaded cameras via local video fallback`);
    console.log(`   so all 9 feeds are functional! If you upgrade your Atlas tier, rerun 'npm run upload'.`);
  }
  console.log('================================\n');

  await closeDB();
}

uploadVideos();
