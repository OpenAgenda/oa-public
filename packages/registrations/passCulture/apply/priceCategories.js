import _ from 'lodash';
import getMatchingPassId from '../iso/getMatchingPassId.js';
import handleError from './handleError.js';

const formatPriceCategory = (priceCategory) =>
  _.omit(
    {
      ...priceCategory,
      price: parseFloat(priceCategory.price),
    },
    ['id'],
  );

async function update(
  { pc },
  passEventOfferId,
  _passAddressId,
  _OAEvent,
  processedEntries,
  entry,
) {
  const succeeded = { priceCategories: [] };
  let error;

  for (const priceCategory of entry.priceCategories) {
    try {
      await pc.offers
        .events(passEventOfferId)
        .priceCategories(getMatchingPassId(processedEntries, priceCategory.id))
        .patch(_.omit(priceCategory, ['id']));
      succeeded.priceCategories.push(priceCategory);
    } catch (e) {
      error = handleError('priceCategories update', e);
      break;
    }
  }

  return {
    succeeded,
    remaining:
      succeeded.priceCategories.length === entry.priceCategories.length
        ? []
        : entry.priceCategories.slice(succeeded.priceCategories.length),
    error,
  };
}

async function create(
  { pc },
  passEventOfferId,
  _passAddressId,
  _OAEvent,
  _processedEntries,
  entry,
) {
  const { priceCategories: createdPriceCategories, error } = await pc.offers
    .events(passEventOfferId)
    .priceCategories.create({
      priceCategories: entry.priceCategories.map(formatPriceCategory),
    })
    .catch((e) => ({ error: handleError('priceCategories create', e) }));

  return {
    succeeded: error ? undefined : entry,
    response: error
      ? undefined
      : {
        priceCategories: entry.priceCategories.map(({ id }, index) => ({
          id,
          passId: createdPriceCategories[index].id,
        })),
      },
    remaining: error ? entry.priceCategories : undefined,
    error,
  };
}

export default {
  create,
  update,
};
