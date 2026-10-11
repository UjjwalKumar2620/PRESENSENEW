/**
 * Vercel Serverless Function entry point for PreSense API.
 * Forwards requests to the main Express backend application.
 */
const app = require('../backend/server');

module.exports = app;
