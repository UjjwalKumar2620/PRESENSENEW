/**
 * Test MongoDB Atlas connectivity.
 * Run: npm run test:connection (from backend/)
 *
 * Validates env vars, attempts connection, pings the server,
 * and reports the result without exposing credentials.
 */

require('dotenv').config();
const { connectDB, closeDB } = require('../db/connection');

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...\n');

  try {
    const { db } = await connectDB();

    // List existing collections to verify DB access
    const collections = await db.listCollections().toArray();
    console.log(`📂 Database "${process.env.DB_NAME}" has ${collections.length} collection(s):`);
    collections.forEach((col) => console.log(`   • ${col.name}`));

    console.log('\n✅ Connection test PASSED.\n');
  } catch (err) {
    console.error('❌ Connection test FAILED:');
    console.error(`   ${err.message}\n`);
    process.exit(1);
  } finally {
    await closeDB();
  }
}

testConnection();
