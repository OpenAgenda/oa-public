import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import {
  omit,
  getTimingId,
  isDHMFormat,
  convertDHMToDate,
} from '../lib/utils.js';
import getMatchingPassId from '../iso/getMatchingPassId.js';
import handleError from './handleError.js';

const log = logs('apply/dates');

const formatDate = (OAEvent, entries, date) => {
  const { timingId, priceCategoryId } = date;

  const timing = OAEvent.timings.find(
    (t) => timingId === getTimingId(t, OAEvent.timezone),
  );

  if (!timing) {
    throw new BadRequest('no matching timing was found', {
      info: { timingId },
    });
  }

  return {
    priceCategoryId: getMatchingPassId(entries, priceCategoryId),
    beginningDatetime: isDHMFormat(timing.begin)
      ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone })
      : timing.begin,
    bookingLimitDatetime: isDHMFormat(timing.begin)
      ? convertDHMToDate(timing.begin, { timezone: OAEvent.timezone })
      : timing.begin,
    quantity: date.quantity,
  };
};

async function create(
  pc,
  passEventOfferId,
  _passAddressId,
  OAEvent,
  processedEntries,
  entry,
  { logBundle },
) {
  const formatted = entry.dates.map(
    formatDate.bind(null, OAEvent, processedEntries),
  );

  const createLogBundle = { ...logBundle, entry, formatted };

  log('creating', createLogBundle);

  let response;

  try {
    response = await pc.offers.events(passEventOfferId).dates.create({
      dates: formatted,
    });
  } catch (error) {
    log.info('failed to create dates', {
      ...createLogBundle,
      status: error.response.status,
    });
    return {
      error: handleError('dates create', error),
    };
  }

  const { dates: createdDates } = response;

  log('created', { ...createLogBundle, createdDates });

  return {
    succeeded: entry,
    response: {
      dates: entry.dates.map(({ id }, index) => ({
        id,
        passId: createdDates[index].id,
      })),
    },
  };
}

async function applyDateOperation(
  operation,
  pc,
  passEventOfferId,
  _passAddressId,
  _OAEvent,
  processedEntries,
  entry,
) {
  const succeeded = { dates: [] };
  let error;

  for (const date of entry.dates) {
    try {
      const pcDates = pc.offers
        .events(passEventOfferId)
        .dates(getMatchingPassId(processedEntries, date.id));
      await pcDates[operation](
        operation === 'patch' ? omit(date, ['id']) : undefined,
      );

      succeeded.dates.push(date);
    } catch (e) {
      error = handleError(`dates ${operation}`, e);
      break;
    }
  }

  return {
    succeeded,
    remaining:
      succeeded.dates.length === entry.dates.length
        ? []
        : entry.dates.slice(succeeded.dates.length),
    error,
  };
}

export default {
  create,
  update: applyDateOperation.bind(null, 'patch'),
  delete: applyDateOperation.bind(null, 'delete'),
};
