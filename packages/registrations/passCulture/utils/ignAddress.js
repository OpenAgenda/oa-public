import ky, { TimeoutError } from 'ky';
import logs from '@openagenda/logs';

const log = logs('passCulture/ignAddress');

const IGN_GEOCODING_BASE_URL = 'https://data.geopf.fr/geocodage';

/**
 * Geocode an address using IGN API to get postal code and city
 * @param {string} addressString - The address to geocode
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of results (default: 1)
 * @param {string} options.index - Search index type (default: 'address')
 * @param {number} options.timeout - Request timeout in milliseconds (default: 5000)
 * @returns {Promise<Object>} - Object containing postalCode, city, and coordinates
 */
async function geocodeAddress(addressString, options = {}) {
  // Validate input
  if (
    !addressString
    || typeof addressString !== 'string'
    || addressString.trim() === ''
  ) {
    return {
      success: false,
      data: null,
      error: 'Address string is required and must be a non-empty string',
    };
  }

  const { limit = 1, index = 'address', timeout = 5000 } = options;

  const params = {
    q: addressString.trim(),
    index,
    limit,
  };

  try {
    log.info('Geocoding address with IGN API', {
      address: addressString,
      params,
    });

    const data = await ky
      .get(`${IGN_GEOCODING_BASE_URL}/search`, {
        searchParams: params,
        timeout,
        headers: {
          'User-Agent': 'OpenAgenda-Registrations/1.0',
        },
      })
      .json();

    // Check if we have results
    if (!data || !data.features || data.features.length === 0) {
      log.warn('No results found for address', { address: addressString });
      return {
        success: false,
        data: null,
        error: 'No results found for the provided address',
      };
    }

    // Extract the first (best) result
    const feature = data.features[0];
    const { properties } = feature;
    const { coordinates } = feature.geometry;

    // Extract relevant information
    const result = {
      postalCode: properties.postcode || properties.postal_code || null,
      city: properties.city || properties.citycode || null,
      latitude: coordinates[1], // GeoJSON format: [longitude, latitude]
      longitude: coordinates[0],
      score: properties.score || 0,
      label: properties.label || addressString,
      type: properties._type || 'unknown',
    };

    // Validate that we have the essential information
    if (!result.postalCode || !result.city) {
      log.warn('Incomplete geocoding result', {
        address: addressString,
        result,
      });
      return {
        success: false,
        data: result,
        error: 'Geocoding result is missing postal code or city information',
      };
    }

    log.info('Successfully geocoded address', {
      address: addressString,
      postalCode: result.postalCode,
      city: result.city,
      score: result.score,
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    // Handle different types of errors
    let errorMessage = 'Unknown error occurred during geocoding';

    if (error instanceof TimeoutError) {
      errorMessage = 'Request timeout - IGN API did not respond in time';
    } else if (error.response) {
      // API returned an error response
      const { status, statusText } = error.response;

      if (status === 429) {
        errorMessage = 'Rate limit exceeded - too many requests to IGN API';
      } else if (status >= 500) {
        errorMessage = `IGN API server error (${status}): ${statusText}`;
      } else if (status >= 400) {
        errorMessage = `IGN API client error (${status}): ${statusText}`;
      } else {
        errorMessage = `IGN API error (${status}): ${statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Network error - unable to reach IGN API';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }

    log.error('Failed to geocode address', {
      address: addressString,
      error: errorMessage,
      originalError: error.message,
    });

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Reverse geocode coordinates using IGN API to get address information
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {Object} options - Optional parameters
 * @param {number} options.limit - Maximum number of results (default: 1)
 * @param {string} options.index - Search index type (default: 'address')
 * @param {number} options.timeout - Request timeout in milliseconds (default: 5000)
 * @returns {Promise<Object>} - Object containing address information
 */
async function reverseGeocode(latitude, longitude, options = {}) {
  // Validate input
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return {
      success: false,
      data: null,
      error: 'Latitude and longitude must be numbers',
    };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      success: false,
      data: null,
      error:
        'Invalid coordinates - latitude must be between -90 and 90, longitude between -180 and 180',
    };
  }

  const { limit = 1, index = 'address', timeout = 5000 } = options;

  const params = {
    lat: latitude,
    lon: longitude,
    index,
    limit,
  };

  try {
    log.info('Reverse geocoding coordinates with IGN API', {
      latitude,
      longitude,
      params,
    });

    const data = await ky
      .get(`${IGN_GEOCODING_BASE_URL}/reverse`, {
        searchParams: params,
        timeout,
        headers: {
          'User-Agent': 'OpenAgenda-Registrations/1.0',
        },
      })
      .json();

    // Check if we have results
    if (!data || !data.features || data.features.length === 0) {
      log.warn('No results found for coordinates', { latitude, longitude });
      return {
        success: false,
        data: null,
        error: 'No address found for the provided coordinates',
      };
    }

    // Extract the first (closest) result
    const feature = data.features[0];
    const { properties } = feature;

    const result = {
      postalCode: properties.postcode || properties.postal_code || null,
      city: properties.city || properties.citycode || null,
      address: properties.label || null,
      distance: properties.distance || 0,
      score: properties.score || 0,
      type: properties._type || 'unknown',
    };

    log.info('Successfully reverse geocoded coordinates', {
      latitude,
      longitude,
      address: result.address,
      distance: result.distance,
    });

    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred during reverse geocoding';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - IGN API did not respond in time';
    } else if (error.response) {
      const { status, statusText } = error.response;

      if (status === 429) {
        errorMessage = 'Rate limit exceeded - too many requests to IGN API';
      } else if (status >= 500) {
        errorMessage = `IGN API server error (${status}): ${statusText}`;
      } else if (status >= 400) {
        errorMessage = `IGN API client error (${status}): ${statusText}`;
      } else {
        errorMessage = `IGN API error (${status}): ${statusText}`;
      }
    } else if (error.request) {
      errorMessage = 'Network error - unable to reach IGN API';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }

    log.error('Failed to reverse geocode coordinates', {
      latitude,
      longitude,
      error: errorMessage,
      originalError: error.message,
    });

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

export default {
  geocodeAddress,
  reverseGeocode,
};

export { geocodeAddress, reverseGeocode };
