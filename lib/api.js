import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * DPD API Client (ported from Python dpdtrack)
 * Uses myDPD Austria API with POST requests
 */
export class DPDClient {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // Start with 1s
    this.countries = null;
  }

  /**
   * Load country configuration
   */
  async loadCountries() {
    if (this.countries) return this.countries;
    
    const configPath = join(__dirname, '../config/countries.json');
    const data = await readFile(configPath, 'utf-8');
    this.countries = JSON.parse(data);
    return this.countries;
  }

  /**
   * Get endpoint for country
   */
  async getEndpoint(countryCode, hasPostalCode = false) {
    await this.loadCountries();
    
    const country = this.countries[countryCode.toUpperCase()];
    if (!country) {
      throw new Error(`Unsupported country: ${countryCode}. Supported: ${Object.keys(this.countries).join(', ')}`);
    }
    
    // Return verify endpoint if postal code provided, otherwise search
    return hasPostalCode ? country.verifyEndpoint : country.searchEndpoint;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Track parcel with retry logic (ported from Python dpdtrack)
   * @param {string} trackingNumber - DPD tracking number
   * @param {string} postalCode - Recipient postal code (for verification)
   * @param {string} country - Country code (AT, DE, etc.)
   * @returns {Promise<object>} Tracking data
   */
  async track(trackingNumber, postalCode, country = 'AT') {
    const hasPostalCode = !!postalCode;
    const endpoint = await this.getEndpoint(country, hasPostalCode);
    
    // Build JSON payload based on whether postal code is provided
    // Python logic: payload = tracking_number OR [tracking_number, postal_code]
    const payload = hasPostalCode ? [trackingNumber, postalCode] : trackingNumber;

    let lastError = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; DPDTrack/JS; +https://openclaw.ai)'
          },
          body: JSON.stringify(payload)
        });

        // Check HTTP status
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // myDPD API returns { data: [...] } or error response
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          throw new Error('TRACKING_NOT_FOUND');
        }

        const parcel = data.data[0];

        // Check if lifecycle data exists
        if (!parcel.lifecycle || !parcel.lifecycle.entries || parcel.lifecycle.entries.length === 0) {
          throw new Error('TRACKING_NOT_FOUND');
        }

        // Parse events from lifecycle entries
        const events = parcel.lifecycle.entries.map(entry => {
          // Parse datetime (format: YYYYMMDDHHmmss)
          const dateStr = entry.datetime;
          const timestamp = new Date(
            parseInt(dateStr.substring(0, 4)),  // year
            parseInt(dateStr.substring(4, 6)) - 1, // month (0-indexed)
            parseInt(dateStr.substring(6, 8)),  // day
            parseInt(dateStr.substring(8, 10)), // hour
            parseInt(dateStr.substring(10, 12)), // minute
            parseInt(dateStr.substring(12, 14))  // second
          );

          // Build location from depotData if available
          let location = null;
          if (entry.depotData && Array.isArray(entry.depotData)) {
            location = entry.depotData.join(', ');
          }

          return {
            timestamp: timestamp.toISOString(),
            description: entry.state?.text || 'Unknown status',
            location,
            raw: entry
          };
        });

        // Success!
        return {
          success: true,
          trackingNumber: parcel.pno,
          country,
          events,
          raw: data
        };

      } catch (error) {
        lastError = error;

        // Don't retry on known permanent errors
        if (error.message === 'TRACKING_NOT_FOUND') {
          throw new Error(`Tracking number not found: ${trackingNumber}. The parcel might not be in the system yet.`);
        }

        if (error.message.includes('Unsupported country')) {
          throw error; // Don't retry config errors
        }

        // Exponential backoff for retryable errors
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          console.error(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }
}

export default DPDClient;
