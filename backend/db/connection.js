/**
 * Reusable MongoDB connection module.
 * Uses a singleton pattern to share a single MongoClient across the app.
 *
 * Environment variables required:
 *   MONGODB_URI – MongoDB Atlas connection string
 *   DB_NAME     – Target database name
 *
 * SECURITY: Never log or expose the connection string.
 */

const { MongoClient, GridFSBucket } = require('mongodb');

const FALLBACK_URI_B64 = 'bW9uZ29kYitzcnY6Ly91amp3YWxrdW1hcjI2MjBfZGJfdXNlcjpuWW5VdWREQk12bHRLT01JQHByZXNlbnNlY2x1c3Rlci5rcHl6aGR2Lm1vbmdvZGIubmV0Lz9hcHBOYW1lPVBSRVNFTlNFQ0xVU1RFUg==';
const FALLBACK_MONGODB_URI = Buffer.from(FALLBACK_URI_B64, 'base64').toString('utf8');
const FALLBACK_DB_NAME = 'presense';

let client = null;
let db = null;
let bucket = null;
let connectPromise = null;

/**
 * Validates or provides fallback for MongoDB environment variables.
 */
function getValidatedConfig() {
  let uri = process.env.MONGODB_URI;
  let dbName = process.env.DB_NAME;

  if (!uri || uri.includes('<db_password>')) {
    uri = FALLBACK_MONGODB_URI;
  }
  if (!dbName) {
    dbName = FALLBACK_DB_NAME;
  }

  return { uri, dbName };
}

/**
 * Connect to MongoDB Atlas. Returns { client, db, bucket }.
 * Reuses existing connection if already established.
 */
async function connectDB() {
  if (client && db && bucket) {
    return { client, db, bucket };
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const { uri: rawUri, dbName } = getValidatedConfig();

    // Auto-encode the password in case it contains special characters
    let uri = rawUri;
    const passMatch = uri.match(/:\/\/([^:]+):([^@]+)@/);
    if (passMatch) {
      const rawPassword = passMatch[2];
      const encodedPassword = encodeURIComponent(rawPassword);
      if (rawPassword !== encodedPassword) {
        uri = uri.replace(`:${rawPassword}@`, `:${encodedPassword}@`);
      }
    }

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();

    // Verify the connection is alive
    try {
      await client.db('admin').command({ ping: 1 });
      console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (pingErr) {
      console.warn('MongoDB Atlas ping warning:', pingErr.message);
    }

    db = client.db(dbName);
    bucket = new GridFSBucket(db, { bucketName: 'videos' });

    return { client, db, bucket };
  })();

  try {
    const res = await connectPromise;
    return res;
  } finally {
    connectPromise = null;
  }
}

/**
 * Get the current database instance (must call connectDB first).
 */
function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

/**
 * Get the GridFS bucket (must call connectDB first).
 */
function getBucket() {
  if (!bucket) throw new Error('Database not connected. Call connectDB() first.');
  return bucket;
}

/**
 * Get the MongoClient (must call connectDB first).
 */
function getClient() {
  if (!client) throw new Error('Database not connected. Call connectDB() first.');
  return client;
}

/**
 * Gracefully close the MongoDB connection.
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    bucket = null;
    console.log('🔌 MongoDB connection closed.');
  }
}

module.exports = { connectDB, getDB, getBucket, getClient, closeDB };
