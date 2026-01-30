import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * DPD API Client with retry logic
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
  async getEndpoint(countryCode) {
    await this.loadCountries();
    
    const country = this.countries[countryCode.toUpperCase()];
    if (!country) {
      throw new Error(`Unsupported country: ${countryCode}. Supported: ${Object.keys(this.countries).join(', ')}`);
    }
    
    return country.endpoint;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Track parcel with retry logic
   * @param {string} trackingNumber - DPD tracking number
   * @param {string} postalCode - Recipient postal code (for verification)
   * @param {string} country - Country code (AT, DE, etc.)
   * @returns {Promise<object>} Tracking data
   */
  async track(trackingNumber, postalCode, country = 'AT') {
    const endpoint = await this.getEndpoint(country);
    const url = `${endpoint}${trackingNumber}`;

    let lastError = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'dpd-tracking-cli/1.0'
          }
        });

        // Check HTTP status
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();

        // DPD API wraps data in parcellifecycleResponse
        const data = rawData.parcellifecycleResponse || rawData;

        // DPD API returns null parcelLifeCycleData when package not found or not yet in system
        if (!data.parcelLifeCycleData || data.parcelLifeCycleData === null) {
          throw new Error('TRACKING_NOT_FOUND');
        }

        // Verify postal code if provided (DPD sends destinationDepot with PLZ info)
        if (postalCode && data.parcelLifeCycleData?.destinationDepot?.geoLocation?.zipCode) {
          const apiZip = data.parcelLifeCycleData.destinationDepot.geoLocation.zipCode;
          if (apiZip !== postalCode) {
            throw new Error(`Postal code mismatch. Expected: ${postalCode}, Got: ${apiZip}`);
          }
        }

        // Success!
        return {
          success: true,
          data: data.parcelLifeCycleData,
          trackingNumber,
          country
        };

      } catch (error) {
        lastError = error;

        // Don't retry on known permanent errors
        if (error.message === 'TRACKING_NOT_FOUND') {
          throw new Error(`Tracking number not found: ${trackingNumber}. The parcel might not be in the system yet.`);
        }

        if (error.message.includes('Postal code mismatch')) {
          throw error; // Don't retry postal code errors
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
