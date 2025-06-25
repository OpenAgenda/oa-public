import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from '../lib/formatEvent.js';
import handleError from './handleError.js';
import address from './address.js';

const log = logs('passCulture/eventOffer');

async function update(
  pc,
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

  const eventOffer = await formatEvent(
    OAEvent,
    { ...entry, addressId: passAddressId },
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
