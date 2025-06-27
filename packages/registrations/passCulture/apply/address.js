import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import { geocodeAddress } from '../utils/ignAddress.js';
import extractStreetFromOAAddress from '../lib/extractStreetFromOAAddress.js';

const log = logs('passCulture/address');

const isPostalCodeMismatch = (e, location) =>
  e
  === `No municipality found for \`city=${location.city}\` and \`postalCode=${location.postalCode}\``;

const venueDiffThanLoc = ({ venueLoc, location }) => {
  if (!venueLoc || !location) return true; // If either is missing, consider them different

  return (
    venueLoc.address !== location.address
    || venueLoc.city !== location.city
    || venueLoc.postalCode !== location.postalCode
  );
};

async function createAddressIfNeeded(pc, OAEvent, usedVenue, siren) {
  // Check if OA location is different from venue
  if (
    !venueDiffThanLoc({
      venueLoc: usedVenue.location,
      location: OAEvent.location,
    })
  ) {
    return { address: null, error: null };
  }

  // Validate that OAEvent location has a postal code
  if (!OAEvent.location?.postalCode) {
    return {
      address: null,
      error: new BadRequest(
        {
          info: {
            siren,
            location: OAEvent.location,
            eventId: OAEvent.uid,
            reason: 'missing_postal_code',
          },
        },
        'OAEvent location postal code is required',
      ),
    };
  }

  const addressQuery = {
    city: OAEvent.location.city,
    latitude: OAEvent.location.latitude,
    longitude: OAEvent.location.longitude,
    postalCode: OAEvent.location.postalCode,
    street: extractStreetFromOAAddress(OAEvent.location),
  };

  let error = null;
  let originalError = null;

  try {
    return {
      address: await pc.offers.addresses.create(addressQuery),
      error: null,
    };
  } catch (e) {
    originalError = e;
    error = e.response?.data?.__root__?.[0];
    log.error('failed to create address on first attempt', {
      siren,
      addressQuery,
      error: error || e.message,
    });
  }

  // second attempt
  if (isPostalCodeMismatch(error, OAEvent.location)) {
    try {
      const ignAddressResult = await geocodeAddress(OAEvent.location.address);

      if (ignAddressResult.success && ignAddressResult.data) {
        log.info('successfully geocoded address with IGN', {
          original: OAEvent.location,
          corrected: ignAddressResult.data,
        });
        return {
          address: await pc.offers.addresses.create({
            ...addressQuery,
            postalCode: ignAddressResult.data.postalCode,
            city: ignAddressResult.data.city,
          }),
          error: null,
        };
      }
      log.warn('IGN geocoding failed or returned no data', {
        address: OAEvent.location.address,
        result: ignAddressResult,
      });
    } catch (e) {
      log.error('failed to fetch IGN address', {
        OALocationAddress: OAEvent.location.address,
        error: e.message,
      });
    }
  }

  // stop trying - create comprehensive error with all context
  return {
    address: null,
    error: new BadRequest(
      {
        info: {
          siren,
          location: OAEvent.location,
          eventId: OAEvent.uid,
          addressQuery,
          originalError: originalError?.message,
          apiError: error,
          reason: 'address_creation_failed',
          attempts: [
            'initial_creation',
            ...isPostalCodeMismatch(error, OAEvent.location)
              ? ['ign_geocoding']
              : [],
          ],
        },
        cause: originalError,
      },
      'Failed to create address for event location',
    ),
  };
}

export default {
  createAddressIfNeeded,
};
