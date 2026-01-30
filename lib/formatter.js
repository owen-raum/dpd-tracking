import chalk from 'chalk';

/**
 * Format tracking data for human-readable output (myDPD API format)
 */
export function formatHuman(result) {
  const { trackingNumber, country, events } = result;
  
  if (!events || events.length === 0) {
    return chalk.red('❌ No tracking data available');
  }

  let output = '';
  
  // Header
  output += chalk.bold.cyan(`📦 DPD Tracking: ${trackingNumber}\n`);
  output += chalk.gray(`Country: ${country}\n\n`);
  
  // Status from latest event
  const latestEvent = events[0];
  output += chalk.bold('Status: ') + getStatusColor(latestEvent.description) + '\n';
  
  // Location from latest event
  if (latestEvent.location) {
    output += chalk.bold('Location: ') + latestEvent.location + '\n';
  }

  // Last event details
  output += chalk.bold('Last Update: ');
  output += formatEvent(latestEvent) + '\n';

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
  
  if (statusLower.includes('zugestellt') || statusLower.includes('delivered')) {
    return chalk.green(status);
  }
  
  if (statusLower.includes('transit') || statusLower.includes('sortiert') || statusLower.includes('sorted')) {
    return chalk.yellow(status);
  }
  
  if (statusLower.includes('depot') || statusLower.includes('paketzentrum')) {
    return chalk.blue(status);
  }
  
  if (statusLower.includes('problem') || statusLower.includes('fehlgeschlagen') || statusLower.includes('failed')) {
    return chalk.red(status);
  }
  
  return chalk.white(status);
}

/**
 * Format a single event (myDPD format)
 */
function formatEvent(event) {
  let text = '';
  
  // Date & Time
  if (event.timestamp) {
    const date = new Date(event.timestamp);
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
  if (event.location) {
    text += chalk.cyan(event.location);
    text += ' ';
  }
  
  // Description
  if (event.description) {
    text += event.description;
  }
  
  return text;
}

/**
 * Format error message
 */
export function formatError(error) {
  return chalk.red('❌ Error: ') + error.message;
}
