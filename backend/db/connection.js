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

let client = null;
let db = null;
let bucket = null;

/**
 * Validates that required environment variables are present.
 * Throws a descriptive error (without exposing secrets) if missing.
 */
function validateEnv() {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.DB_NAME) missing.push('DB_NAME');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please configure them in your backend/.env file.'
    );
  }

  if (process.env.MONGODB_URI.includes('<db_password>')) {
    throw new Error(
      'MONGODB_URI still contains the placeholder <db_password>. ' +
        'Please replace it with your actual database password in backend/.env.'
    );
  }
}

/**
 * Connect to MongoDB Atlas. Returns { client, db, bucket }.
 * Reuses existing connection if already established.
 */
async function connectDB() {
  if (client && db && bucket) {
    return { client, db, bucket };
  }

  validateEnv();

  // Auto-encode the password in case it contains special characters
  let uri = process.env.MONGODB_URI;
  const passMatch = uri.match(/:\/\/([^:]+):([^@]+)@/);
  if (passMatch) {
    const rawPassword = passMatch[2];
    const encodedPassword = encodeURIComponent(rawPassword);
    if (rawPassword !== encodedPassword) {
      uri = uri.replace(`:${rawPassword}@`, `:${encodedPassword}@`);
    }
  }
  const dbName = process.env.DB_NAME;

  client = new MongoClient(uri, {
    // Recommended settings for Atlas
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  await client.connect();

  // Verify the connection is alive
  await client.db('admin').command({ ping: 1 });
  console.log('✅ Connected to MongoDB Atlas successfully.');

  db = client.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: 'videos' });

  return { client, db, bucket };
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
