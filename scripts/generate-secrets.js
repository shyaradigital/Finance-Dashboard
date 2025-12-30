#!/usr/bin/env node

/**
 * Generate secure random secrets for environment variables
 * Usage: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('🔐 Generated Secure Secrets for Environment Variables\n');
console.log('Copy these to your Render environment variables:\n');
console.log('JWT_SECRET=' + generateSecret(32));
console.log('JWT_REFRESH_SECRET=' + generateSecret(32));
console.log('ENCRYPTION_KEY=' + generateSecret(32));
console.log('\n✅ All secrets are 64 characters long and cryptographically secure');

