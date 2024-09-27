import formatEvent from '../lib/formatEvent.js';
import handleError from './handleError.js';

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

async function create(pc, OAEvent, entry, options) {
  const { categories: categoriesFromOptions, related: relatedFromOptions } = options;

  const { categories, related } = !categoriesFromOptions || !relatedFromOptions
    ? await pc.offers.events.categories.list()
    : { categories: categoriesFromOptions, related: relatedFromOptions };

  const eventOffer = await formatEvent(OAEvent, entry, {
    ...options,
    categories,
    related,
  });

  const { id, status, error } = await pc.offers.events
    .create(eventOffer)
    .catch((e) => ({ error: handleError('eventOffer create', e) }));

  return {
    succeeded: error ? undefined : entry,
    error,
    response: {
      passId: id,
      isPending: status === 'PENDING',
    },
  };
}

export default {
  create,
  update,
};
