import logs from '@openagenda/logs';
import AdresseDataGouvFR from '@openagenda/geocoder/AdresseDataGouvFR.js';
import extractStreetFromOAAddress from '../lib/extractStreetFromOAAddress.js';
import handleError from './handleError.js';

const log = logs('passCulture/address');

async function createAddressIfNeeded(pc, OAEvent, usedVenue, siren) {
  const venueDiffThanLoc = ({ venueLoc, location }) => {
    if (!venueLoc || !location) return true; // If either is missing, consider them different

    return (
      venueLoc.address !== location.address
      || venueLoc.city !== location.city
      || venueLoc.postalCode !== location.postalCode
    );
  };

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
      error: new Error('OAEvent location postal code is required'),
    };
  }

  let address = null;

  try {
    log.info('trying to create address');
    address = await pc.offers.addresses.create({
      city: OAEvent.location.city,
      latitude: OAEvent.location.latitude,
      longitude: OAEvent.location.longitude,
      postalCode: OAEvent.location.postalCode,
      street: extractStreetFromOAAddress(OAEvent.location),
    });
  } catch (error) {
    const [firstError] = error.response.data.__root__;
    if (
      firstError
      === `No municipality found for \`city=${OAEvent.location.city}\` and \`postalCode=${OAEvent.location.postalCode}\``
    ) {
      try {
        const adresseDataGouvFRResult = await AdresseDataGouvFR.detailed(
          OAEvent.location.address,
        );
        address = await pc.offers.addresses.create({
          city: adresseDataGouvFRResult.city,
          latitude: OAEvent.location.latitude,
          longitude: OAEvent.location.longitude,
          postalCode: adresseDataGouvFRResult.postalCode,
          street: extractStreetFromOAAddress(OAEvent.location),
        });
      } catch (err) {
        return {
          address: null,
          error: handleError('failed to create pass address', {
            response: err.response,
            siren,
            location: OAEvent.location,
          }),
        };
      }
    } else {
      return {
        address: null,
        error: handleError('failed to create pass address', {
          response: error.response,
          siren,
          location: OAEvent.location,
        }),
      };
    }
  }

  log.info('created address', address);
  return { address, error: null };
}

export default {
  createAddressIfNeeded,
};
