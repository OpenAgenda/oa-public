import _ from 'lodash';
import getMatchingPassId from './getMatchingPassId.js';

const formatDate = (entries, date) => _.omit({
  ...date,
  passCategoryId: getMatchingPassId(entries, date.priceCategoryId),
}, ['id']);

async function update(pc, passEventOfferId, OAEvent, processedEntries, entry) {
  const succeeded = { dates: [] };
  let error;

  for (const date of entry.dates) {
    try {
      await pc.offers.events(passEventOfferId)
        .dates(
          getMatchingPassId(processedEntries, date.id),
        ).patch(_.omit(date, ['id']));

      succeeded.dates.push(date);
    } catch (e) {
      error = e;
      break;
    }
  }

  return {
    succeeded,
    remaining: succeeded.dates.length === entry.dates.length ? [] : entry.dates.slice(succeeded.dates.length),
    error,
  };
}

async function create(pc, passEventOfferId, _OAEvent, processedEntries, entry) {
  const {
    dates: createdDates,
  } = await pc.offers.events(passEventOfferId).dates.create({
    dates: entry.dates.map(formatDate.bind(null, processedEntries)),
  });

  return {
    succeeded: entry,
    result: {
      dates: entry.dates.map(({ id }, index) => ({
        id,
        passId: createdDates[index].id,
      })),
    },
  };
}

export default {
  create,
  update,
};
