import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from '../lib/formatEvent.js';
import handleError from './handleError.js';
import address from './address.js';

const log = logs('passCulture/eventOffer');

async function update(
  { pc, siren },
  passEventOfferId,
  passAddressId,
  OAEvent,
  _processedEntries,
  entry,
  options,
) {
  const { categories: categoriesFromOptions, related: relatedFromOptions } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : { categories: categoriesFromOptions, related: relatedFromOptions };

  // Check if address needs to be updated
  let finalAddressId = passAddressId;
  let addressError = null;

  if (passAddressId && OAEvent.location) {
    console.log('this', passAddressId, OAEvent.location, { siren });
    try {
      // Fetch current address from Pass Culture
      const currentAddress = await pc.offers.addresses(passAddressId).get();
      console.log('currentAddress', currentAddress);
      // Compare current address with OA event location
      const addressDifferent = currentAddress.address !== OAEvent.location.address
        || currentAddress.city !== OAEvent.location.city
        || currentAddress.postalCode !== OAEvent.location.postalCode;

      if (addressDifferent) {
        log('Address differs, creating new address', {
          currentAddress: {
            address: currentAddress.address,
            city: currentAddress.city,
            postalCode: currentAddress.postalCode,
          },
          newLocation: {
            address: OAEvent.location.address,
            city: OAEvent.location.city,
            postalCode: OAEvent.location.postalCode,
          },
        });

        const offererVenues = await Promise.all(
          siren.map((sirenValue) =>
            pc.offers.offererVenues({ siren: sirenValue })),
        );
        const venues = offererVenues.flatMap((responseArray) =>
          responseArray.flatMap((item) => item.venues));
        const usedVenue = venues.find((v) => v.id === entry.venueId);
        // Create new address using existing logic
        const { address: newAddress, error: newAddressError } = await address.createAddressIfNeeded(
          pc,
          OAEvent,
          usedVenue, // Pass current address as venue-like object
          options.siren || [],
        );

        if (newAddressError) {
          addressError = newAddressError;
        } else if (newAddress) {
          finalAddressId = newAddress.id;
          log('New address created', { newAddressId: finalAddressId });
        }
      } else {
        log('Address unchanged, keeping existing addressId', {
          addressId: passAddressId,
        });
      }
    } catch (e) {
      log.error('Failed to fetch current address', {
        passAddressId,
        error: e.message,
      });
      // Continue with existing addressId if we can't fetch current address
    }
  }

  // Return early if there was an address error
  if (addressError) {
    return {
      succeeded: undefined,
      remaining: entry,
      error: addressError,
    };
  }

  const eventOffer = await formatEvent(
    OAEvent,
    { ...entry, addressId: finalAddressId },
    {
      ...options,
      categories,
      related,
      patch: true,
    },
  );

  const { error } = await pc.offers
    .events(passEventOfferId)
    .patch(eventOffer)
    .catch((e) => ({
      error: handleError('eventOffer update', e),
    }));

  return {
    succeeded: error ? undefined : entry,
    remaining: error ? entry : undefined,
    error,
  };
}

async function create({ pc, siren }, OAEvent, entry, options) {
  const { categories: categoriesFromOptions, related: relatedFromOptions } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : { categories: categoriesFromOptions, related: relatedFromOptions };

  // check if oa location is diffrent from venue
  log('fetching venues with', siren);
  const offererVenues = await Promise.all(
    siren.map((sirenValue) => pc.offers.offererVenues({ siren: sirenValue })),
  );
  const venues = offererVenues.flatMap((responseArray) =>
    responseArray.flatMap((item) => item.venues));
  const usedVenue = venues.find((v) => v.id === entry.venueId);

  if (!usedVenue) {
    return {
      error: new BadRequest({
        info: {
          entryVenueId: entry.venueId,
          venues,
        },
      }),
    };
  }

  // Create address if needed using the address module
  const { address: createdAddress, error: addressError } = await address.createAddressIfNeeded(pc, OAEvent, usedVenue, siren);

  if (addressError) {
    return {
      error: addressError,
    };
  }
  const eventOffer = await formatEvent(
    OAEvent,
    { ...entry, addressId: createdAddress?.id },
    {
      ...options,
      categories,
      related,
    },
  );

  const { id, status, error } = await pc.offers.events
    .create(eventOffer)
    .catch((e) => ({ error: handleError('eventOffer create', e) }));

  return {
    succeeded: error ? undefined : entry,
    error,
    response: {
      addressId: createdAddress?.id,
      passId: id,
      isPending: status === 'PENDING',
    },
  };
}

export default {
  create,
  update,
};
