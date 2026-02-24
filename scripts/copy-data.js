#!/usr/bin/env node

/**
 * Automates copying recommendations.json from root to web/public
 * Runs before dev/build to ensure data is up-to-date
 */

import { copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const source = join(rootDir, 'recommendations.json');
const dest = join(rootDir, 'web', 'public', 'recommendations.json');

if (!existsSync(source)) {
  console.error('❌ Source file not found:', source);
  process.exit(1);
}

try {
  copyFileSync(source, dest);
  console.log('✅ Copied recommendations.json to web/public/');
} catch (error) {
  console.error('❌ Failed to copy file:', error.message);
  process.exit(1);
}
