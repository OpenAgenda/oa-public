import formatEvent from '../lib/formatEvent.js';

// async function update(pc, OAEvent, entry) {}

async function create(pc, OAEvent, entry, options) {
  const {
    categories: categoriesFromOptions,
    related: relatedFromOptions,
  } = options;

  const {
    categories,
    related,
  } = !categoriesFromOptions || !relatedFromOptions ? await pc.offers.events.categories.list() : { categories: categoriesFromOptions, related: relatedFromOptions };

  const eventOffer = await formatEvent(OAEvent, entry, {
    ...options,
    categories,
    related,
  });

  const { id, status } = await pc.offers.events.create(eventOffer);

  return {
    succeeded: entry,
    result: {
      passId: id,
      isPending: status === 'PENDING',
    },
  };
}

export default {
  create,
  // update,
};
