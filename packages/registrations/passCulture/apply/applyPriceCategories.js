import _ from 'lodash';
import getMatchingPassId from './getMatchingPassId.js';

const formatPriceCategory = priceCategory => _.omit({
  ...priceCategory,
  price: parseFloat(priceCategory.price),
}, ['id']);

async function update(pc, passEventOfferId, _OAEvent, processedEntries, entry) {
  const succeeded = { priceCategories: [] };
  let error;

  for (const priceCategory of entry.priceCategories) {
    try {
      await pc.offers.events(passEventOfferId)
        .priceCategories(
          getMatchingPassId(processedEntries, priceCategory.id),
        ).patch(_.omit(priceCategory, ['id']));
      succeeded.priceCategories.push(priceCategory);
    } catch (e) {
      error = e;
      break;
    }
  }

  return {
    succeeded,
    remaining: succeeded.priceCategories.length === entry.priceCategories.length ? [] : entry.priceCategories.slice(succeeded.priceCategories.length),
    error,
  };
}

async function create(pc, passEventOfferId, _OAEvent, _processedEntries, entry) {
  const {
    priceCategories: createdPriceCategories,
  } = await pc.offers.events(passEventOfferId).priceCategories.create({
    priceCategories: entry.priceCategories.map(formatPriceCategory),
  });

  return {
    succeeded: entry,
    result: {
      priceCategories: entry.priceCategories.map(({ id }, index) => ({
        id,
        passId: createdPriceCategories[index].id,
      })),
    },
  };
}

export default {
  create,
  update,
};
