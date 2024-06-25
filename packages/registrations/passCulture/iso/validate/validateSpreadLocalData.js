import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';

import { getCurrentValue, getObjectType } from '../utils.js';
import validateMergedLocalData from './validateMergedLocalData.js';
import validateEventOffer from './validateEventOffer.js';
import { validateDates } from './validateDate.js';
import { validatePriceCategories } from './validatePriceCategory.js';

const log = logs('validateSpreadLocalData');

export default function validateSpreadLocalData(data, event, params = {}) {
  const processedItems = data.reduce((processed, entry, index) => {
    const current = { merged: {} };

    if (!params.categories) {
      throw new Error('categories are required for event offer validation');
    }

    try {
      current.merged.clean = validateMergedLocalData(
        getCurrentValue(
          processed.map(({ clean }) => clean).concat(entry),
        ),
        event,
        params,
      );
    } catch (error) {
      current.merged.errors = error.info.errors;
    }

    log('merge at step', { index, merged: current.merged });

    const type = getObjectType(entry); // eventOffer, dates ou priceCategories

    try {
      log('evaluating entry', { type, entry });
      current.clean = ['response', 'appliedAt', 'operation'].reduce((clean, key) => ({
        ...clean,
        ...entry[key] ? { [key]: entry[key] } : undefined,
      }), {
        ...type === 'eventOffer' ? validateEventOffer(entry, { ...params, partial: true }) : undefined,
        ...type === 'priceCategories' ? { priceCategories: validatePriceCategories(entry.priceCategories) } : undefined,
        ...type === 'dates' ? { dates: validateDates(entry.dates, current.merged.clean?.priceCategories, event) } : undefined,
      });
    } catch (e) {
      if (!e.info?.errors) {
        log('exception on entry evaluation', { error: e, entry });
        throw e;
      }
      log('entry has local validation errors', e.info);
      current.errors = e.info.errors;
    }

    return processed.concat(current);
  }, []);

  if (!processedItems.length) return [];

  const { merged } = processedItems[processedItems.length - 1];

  log('merge of spread data', merged);

  if (merged.errors?.length) {
    throw new BadRequest({ info: { errors: merged.errors } }, 'entries are invalid or incomplete');
  }

  return processedItems.map(({ clean }) => clean);
}
