#!/usr/bin/env node

import { Command } from 'commander';
import { DPDClient } from '../lib/api.js';
import { formatHuman, formatJSON, formatError } from '../lib/formatter.js';

const program = new Command();

program
  .name('dpd')
  .description('DPD Tracking CLI Tool')
  .version('1.0.0');

// Track command
program
  .argument('<tracking-number>', 'DPD tracking number')
  .option('-z, --zip <code>', 'Postal code for verification', null)
  .option('-c, --country <code>', 'Country code (AT, DE)', 'AT')
  .option('-j, --json', 'Output as JSON', false)
  .option('--retries <count>', 'Max retry attempts', '3')
  .action(async (trackingNumber, options) => {
    try {
      const client = new DPDClient({
        maxRetries: parseInt(options.retries, 10)
      });

      // Track the parcel
      const result = await client.track(
        trackingNumber,
        options.zip,
        options.country
      );

      // Format output
      if (options.json) {
        console.log(formatJSON(result));
      } else {
        console.log(formatHuman(result));
      }

      process.exit(0);

    } catch (error) {
      console.error(formatError(error));
      
      // Exit codes for scripting
      if (error.message.includes('not found')) {
        process.exit(2); // Tracking number not found
      } else if (error.message.includes('Postal code mismatch')) {
        process.exit(3); // Postal code error
      } else if (error.message.includes('Unsupported country')) {
        process.exit(4); // Invalid country
      } else {
        process.exit(1); // General error
      }
    }
  });

program.parse();
