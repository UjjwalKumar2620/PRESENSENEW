/**
 * Camera API routes.
 *
 * GET  /api/cameras           – List all cameras with metadata and availability
 * GET  /api/cameras/:id/stream – Stream video for a camera (supports HTTP Range)
 */

const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const { getDB, getBucket } = require('../db/connection');
const { CAMERAS } = require('../config/cameras');

const router = Router();

// Helper to find local video path if available
function getLocalVideoPath(filename) {
  const rootPath = path.resolve(__dirname, '..', '..', filename);
  if (fs.existsSync(rootPath)) return rootPath;
  const videosSubdir = path.resolve(__dirname, '..', '..', 'videos', filename);
  if (fs.existsSync(videosSubdir)) return videosSubdir;
  return null;
}

/**
 * GET /api/cameras
 * Returns all cameras with their metadata, stream availability, and storage source (gridfs/local).
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const filesCollection = db.collection('videos.files');

    // Fetch all stored video files from Atlas GridFS
    const storedFiles = await filesCollection
      .find({})
      .project({ filename: 1, length: 1, 'metadata.cameraId': 1 })
      .toArray();

    const storedMap = new Map(storedFiles.map((f) => [f.metadata?.cameraId, f]));

    const cameras = CAMERAS.map((cam) => {
      const stored = storedMap.get(cam.id);
      const localPath = getLocalVideoPath(cam.filename);
      let localSize = null;
      if (!stored && localPath) {
        try {
          localSize = fs.statSync(localPath).size;
        } catch {
          // ignore stat errors
        }
      }

      const isAvailable = !!stored || !!localPath;
      const source = stored ? 'gridfs' : localPath ? 'local' : 'none';
      const sizeBytes = stored ? stored.length : localSize;

      return {
        id: cam.id,
        name: cam.name,
        location: cam.location,
        resolution: cam.resolution,
        fps: cam.fps,
        status: cam.status,
        source, // 'gridfs' (Atlas) or 'local' (filesystem fallback)
        videoAvailable: isAvailable,
        videoSizeBytes: sizeBytes,
      };
    });

    res.json({
      success: true,
      count: cameras.length,
      cameras,
    });
  } catch (err) {
    console.error('Error fetching cameras:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch camera list.',
    });
  }
});

/**
 * GET /api/cameras/:id/stream
 * Streams the video for a given camera ID from MongoDB Atlas GridFS (or local fallback).
 * Fully supports HTTP Range requests (RFC 7233) for seeking and progressive playback.
 */
router.get('/:id/stream', async (req, res) => {
  try {
    const cameraId = req.params.id.toUpperCase();
    const camera = CAMERAS.find((c) => c.id === cameraId);

    if (!camera) {
      return res.status(404).json({
        success: false,
        error: `Camera "${cameraId}" not found.`,
      });
    }

    const db = getDB();
    const filesCollection = db.collection('videos.files');

    // Check GridFS first
    const fileDoc = await filesCollection.findOne({
      filename: camera.filename,
      'metadata.cameraId': cameraId,
    });

    if (fileDoc) {
      // Stream from MongoDB Atlas GridFS
      const fileSize = fileDoc.length;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          res.status(416).set('Content-Range', `bytes */${fileSize}`);
          return res.end();
        }

        const chunkSize = end - start + 1;

        res.status(206).set({
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=86400',
          'X-Video-Source': 'MongoDB-Atlas-GridFS',
        });

        const bucket = getBucket();
        const downloadStream = bucket.openDownloadStream(fileDoc._id, {
          start,
          end: end + 1, // GridFS end is exclusive
        });

        downloadStream.on('error', (err) => {
          console.error(`GridFS stream error for ${cameraId}:`, err.message);
          if (!res.headersSent) {
            res.status(500).end();
          }
        });

        return downloadStream.pipe(res);
      } else {
        res.status(200).set({
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'X-Video-Source': 'MongoDB-Atlas-GridFS',
        });

        const bucket = getBucket();
        const downloadStream = bucket.openDownloadStream(fileDoc._id);

        downloadStream.on('error', (err) => {
          console.error(`GridFS stream error for ${cameraId}:`, err.message);
          if (!res.headersSent) {
            res.status(500).end();
          }
        });

        return downloadStream.pipe(res);
      }
    }

    // Local file fallback if not in GridFS
    const localPath = getLocalVideoPath(camera.filename);
    if (!localPath) {
      return res.status(404).json({
        success: false,
        error: `Video for camera "${cameraId}" is not available.`,
      });
    }

    const stat = fs.statSync(localPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = end - start + 1;

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=86400',
        'X-Video-Source': 'Local-Fallback',
      });

      const fileStream = fs.createReadStream(localPath, { start, end });
      return fileStream.pipe(res);
    } else {
      res.status(200).set({
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
        'X-Video-Source': 'Local-Fallback',
      });

      const fileStream = fs.createReadStream(localPath);
      return fileStream.pipe(res);
    }
  } catch (err) {
    console.error('Stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to stream video.',
      });
    }
  }
});

module.exports = router;
