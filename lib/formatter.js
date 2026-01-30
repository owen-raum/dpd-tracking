import chalk from 'chalk';

/**
 * Format tracking data for human-readable output
 */
export function formatHuman(result) {
  const { trackingNumber, country, data } = result;
  
  if (!data) {
    return chalk.red('❌ No tracking data available');
  }

  const parcel = data;
  const statusInfo = parcel.statusInfo || {};
  const events = parcel.scanInfo?.scanLegType || [];
  
  let output = '';
  
  // Header
  output += chalk.bold.cyan(`📦 DPD Tracking: ${trackingNumber}\n`);
  output += chalk.gray(`Country: ${country}\n\n`);
  
  // Status
  const status = statusInfo.statusHasBeenReached || statusInfo.label || 'Unknown';
  output += chalk.bold('Status: ') + getStatusColor(status) + '\n';
  
  // Delivery info
  if (parcel.destinationDepot) {
    const depot = parcel.destinationDepot;
    if (depot.geoLocation) {
      output += chalk.bold('Destination: ');
      output += `${depot.geoLocation.city || ''} ${depot.geoLocation.zipCode || ''}\n`;
    }
  }

  // Last event
  if (events.length > 0) {
    const lastEvent = events[0];
    output += chalk.bold('Last Update: ');
    output += formatEvent(lastEvent) + '\n';
  }

  // Event history
  if (events.length > 1) {
    output += chalk.bold('\nEvent History:\n');
    events.slice(0, 10).forEach(event => {
      output += chalk.gray('  • ') + formatEvent(event) + '\n';
    });
    
    if (events.length > 10) {
      output += chalk.gray(`  ... and ${events.length - 10} more events\n`);
    }
  }

  return output;
}

/**
 * Format tracking data as JSON
 */
export function formatJSON(result) {
  return JSON.stringify(result, null, 2);
}

/**
 * Get color for status
 */
function getStatusColor(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('delivered')) {
    return chalk.green(status);
  }
  
  if (statusLower.includes('transit') || statusLower.includes('sorted')) {
    return chalk.yellow(status);
  }
  
  if (statusLower.includes('depot')) {
    return chalk.blue(status);
  }
  
  if (statusLower.includes('problem') || statusLower.includes('failed')) {
    return chalk.red(status);
  }
  
  return chalk.white(status);
}

/**
 * Format a single scan event
 */
function formatEvent(event) {
  let text = '';
  
  // Date & Time
  if (event.date) {
    const date = new Date(event.date);
    text += chalk.gray(date.toLocaleString('de-AT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }));
    text += ' ';
  }
  
  // Location
  if (event.scanLocation?.city) {
    text += chalk.cyan(event.scanLocation.city);
    text += ' ';
  }
  
  // Label (description)
  if (event.label) {
    text += event.label;
  }
  
  return text;
}

/**
 * Format error message
 */
export function formatError(error) {
  return chalk.red('❌ Error: ') + error.message;
}
