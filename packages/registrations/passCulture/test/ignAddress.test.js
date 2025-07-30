import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { geocodeAddress, reverseGeocode } from '../utils/ignAddress.js';

const IGN_API_BASE = 'https://data.geopf.fr/geocodage';

describe('ignAddress', () => {
  let server;

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('geocodeAddress', () => {
    it('should successfully geocode a valid address', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/search`, ({ request }) => {
          const url = new URL(request.url);
          const q = url.searchParams.get('q');
          const index = url.searchParams.get('index');
          const limit = url.searchParams.get('limit');

          expect(q).toBe('1 Rue de Rivoli, Paris');
          expect(index).toBe('address');
          expect(limit).toBe('1');

          return HttpResponse.json({
            features: [
              {
                properties: {
                  postcode: '75001',
                  city: 'Paris',
                  score: 0.95,
                  label: '1 Rue de Rivoli, 75001 Paris',
                  _type: 'address',
                },
                geometry: {
                  coordinates: [2.3522, 48.8566], // [longitude, latitude]
                },
              },
            ],
          });
        }),
      );

      server.listen();

      const result = await geocodeAddress('1 Rue de Rivoli, Paris');

      expect(result.success).toBe(true);
      expect(result.data.postalCode).toBe('75001');
      expect(result.data.city).toBe('Paris');
      expect(result.data.latitude).toBe(48.8566);
      expect(result.data.longitude).toBe(2.3522);
      expect(result.error).toBeNull();
    });

    it('should handle empty address string', async () => {
      const result = await geocodeAddress('');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Address string is required and must be a non-empty string',
      );
    });

    it('should handle no results from API', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/search`, () =>
          HttpResponse.json({
            features: [],
          })),
      );

      server.listen();

      const result = await geocodeAddress('Invalid Address');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('No results found for the provided address');
    });

    it('should handle incomplete geocoding result', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/search`, () =>
          HttpResponse.json({
            features: [
              {
                properties: {
                  // Missing postcode and city
                  score: 0.5,
                  label: 'Incomplete Address',
                  _type: 'address',
                },
                geometry: {
                  coordinates: [2.3522, 48.8566],
                },
              },
            ],
          })),
      );

      server.listen();

      const result = await geocodeAddress('Incomplete Address');

      expect(result.success).toBe(false);
      expect(result.data).toBeDefined();
      expect(result.error).toBe(
        'Geocoding result is missing postal code or city information',
      );
    });

    it('should handle API timeout error', async () => {
      server = setupServer(
        http.get(
          `${IGN_API_BASE}/search`,
          () =>
            // Simulate a timeout by delaying the response beyond the timeout limit
            new Promise(() => {}),
        ), // Never resolves
      );

      server.listen();

      const result = await geocodeAddress('Test Address', { timeout: 100 });

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Request timeout - IGN API did not respond in time',
      );
    });

    it('should handle API rate limit error', async () => {
      server = setupServer(
        http.get(
          `${IGN_API_BASE}/search`,
          () =>
            new HttpResponse(null, {
              status: 429,
              statusText: 'Too Many Requests',
            }),
        ),
      );

      server.listen();

      const result = await geocodeAddress('Test Address');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Rate limit exceeded - too many requests to IGN API',
      );
    });
  });

  describe('reverseGeocode', () => {
    it('should successfully reverse geocode valid coordinates', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/reverse`, ({ request }) => {
          const url = new URL(request.url);
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          const index = url.searchParams.get('index');
          const limit = url.searchParams.get('limit');

          expect(lat).toBe('48.8566');
          expect(lon).toBe('2.3522');
          expect(index).toBe('address');
          expect(limit).toBe('1');

          return HttpResponse.json({
            features: [
              {
                properties: {
                  postcode: '75001',
                  city: 'Paris',
                  label: '1 Rue de Rivoli, 75001 Paris',
                  distance: 10,
                  score: 0.95,
                  _type: 'address',
                },
              },
            ],
          });
        }),
      );

      server.listen();

      const result = await reverseGeocode(48.8566, 2.3522);

      expect(result.success).toBe(true);
      expect(result.data.postalCode).toBe('75001');
      expect(result.data.city).toBe('Paris');
      expect(result.data.address).toBe('1 Rue de Rivoli, 75001 Paris');
      expect(result.data.distance).toBe(10);
      expect(result.error).toBeNull();
    });

    it('should handle invalid coordinates', async () => {
      const result = await reverseGeocode('invalid', 2.3522);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Latitude and longitude must be numbers');
    });

    it('should handle out of range coordinates', async () => {
      const result = await reverseGeocode(91, 2.3522); // latitude > 90

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'Invalid coordinates - latitude must be between -90 and 90, longitude between -180 and 180',
      );
    });

    it('should handle no results from reverse geocoding', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/reverse`, () =>
          HttpResponse.json({
            features: [],
          })),
      );

      server.listen();

      const result = await reverseGeocode(0, 0); // Middle of ocean

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe(
        'No address found for the provided coordinates',
      );
    });
  });

  describe('integration with custom options', () => {
    it('should use custom options for geocoding', async () => {
      server = setupServer(
        http.get(`${IGN_API_BASE}/search`, ({ request }) => {
          const url = new URL(request.url);
          const q = url.searchParams.get('q');
          const index = url.searchParams.get('index');
          const limit = url.searchParams.get('limit');

          expect(q).toBe('Test Address');
          expect(index).toBe('poi');
          expect(limit).toBe('5');

          return HttpResponse.json({
            features: [
              {
                properties: {
                  postcode: '75001',
                  city: 'Paris',
                  score: 0.95,
                  label: '1 Rue de Rivoli, 75001 Paris',
                  _type: 'address',
                },
                geometry: {
                  coordinates: [2.3522, 48.8566],
                },
              },
            ],
          });
        }),
      );

      server.listen();

      const options = {
        limit: 5,
        index: 'poi',
        timeout: 10000,
      };

      const result = await geocodeAddress('Test Address', options);

      expect(result.success).toBe(true);
    });
  });
});
