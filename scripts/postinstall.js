#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Only show message on global install
if (process.env.npm_config_global === 'true') {
  try {
    const prefix = execSync('npm config get prefix', { encoding: 'utf-8' }).trim();
    const globalBinPath = join(prefix, 'bin');
    
    console.log('\n' + chalk.green('✓ dpd-tracking installed successfully!'));
    console.log('\n' + chalk.bold('Usage:'));
    console.log('  dpd YOUR_TRACKING_NUMBER');
    console.log('\n' + chalk.bold('Installed to:'));
    console.log('  ' + globalBinPath + '/dpd');
    
    // Check if the path is in $PATH
    const paths = process.env.PATH.split(':');
    if (!paths.includes(globalBinPath)) {
      console.log('\n' + chalk.yellow('⚠ Warning: npm global bin directory is not in your $PATH'));
      console.log('\n' + chalk.bold('Quick fix:'));
      console.log('  export PATH="' + globalBinPath + ':$PATH"');
      console.log('\n' + chalk.bold('Alternative (no PATH setup needed):'));
      console.log('  npx dpd-tracking YOUR_TRACKING_NUMBER');
    }
    
    console.log('');
  } catch (err) {
    // Silent fail - don't break installation
  }
}
