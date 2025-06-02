import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from '../lib/formatEvent.js';
import handleError from './handleError.js';

const log = logs('passCulture/eventOffer');

const venueDiffThanLoc = ({ venueLoc, location }) => {
  if (!venueLoc || !location) return true; // If either is missing, consider them different

  return (
    venueLoc.address !== location.address
    || venueLoc.city !== location.city
    || venueLoc.postalCode !== location.postalCode
  );
};

async function update(
  pc,
  passEventOfferId,
  OAEvent,
  _processedEntries,
  entry,
  options,
) {
  const { categories: categoriesFromOptions, related: relatedFromOptions } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : { categories: categoriesFromOptions, related: relatedFromOptions };

  const eventOffer = await formatEvent(OAEvent, entry, {
    ...options,
    categories,
    related,
    patch: true,
  });

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
  let address = null;
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

  if (
    venueDiffThanLoc({
      venueLoc: usedVenue.location,
      location: OAEvent.location,
    })
  ) {
    // Validate that OAEvent location has a postal code
    if (!OAEvent.location?.postalCode) {
      return {
        error: new BadRequest({
          message: 'OAEvent location postal code is required',
          info: {
            location: OAEvent.location,
          },
        }),
      };
    }
    try {
      address = await pc.offers.addresses.create({
        city: OAEvent.location.city,
        latitude: OAEvent.location.latitude,
        longitude: OAEvent.location.longitude,
        postalCode: OAEvent.location.postalCode,
        street: OAEvent.location.address,
      });
      log.info('created address', address);
    } catch (error) {
      log('error', 'address error', error.response.data);
      throw error;
    }
  }
  const eventOffer = await formatEvent(
    OAEvent,
    { ...entry, addressId: address?.id },
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
      addressId: address?.id,
      passId: id,
      isPending: status === 'PENDING',
    },
  };
}

export default {
  create,
  update,
};
