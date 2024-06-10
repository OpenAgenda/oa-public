import { BadRequest } from '@openagenda/verror';

import { getCurrentValue, getObjectType } from '../utils.js';
import validateMergedLocalData from './validateMergedLocalData.js';
import validateEventOffer from './validateEventOffer.js';
import { validateDates } from './validateDate.js';
import { validatePriceCategories } from './validatePriceCategory.js';

export default function validateSpreadLocalData(data, event, options = {}) {
  const processedItems = data.reduce((processed, entry) => {
    const current = { merged: {} };

    try {
      current.merged.clean = validateMergedLocalData(
        getCurrentValue(
          processed.map(({ clean }) => clean).concat(entry),
        ),
        event,
        options,
      );
    } catch (error) {
      current.merged.errors = error.info.errors;
    }

    const type = getObjectType(entry); // eventOffer, dates ou priceCategories

    try {
      current.clean = ['response', 'appliedAt', 'operation'].reduce((clean, key) => ({
        ...clean,
        ...entry[key] ? { [key]: entry[key] } : undefined,
      }), {
        ...type === 'eventOffer' ? validateEventOffer(entry, options) : undefined,
        ...type === 'priceCategories' ? { priceCategories: validatePriceCategories(entry.priceCategories) } : undefined,
        ...type === 'dates' ? { dates: validateDates(entry.dates, current.merged.clean.priceCategories, event) } : undefined,
      });
    } catch (e) {
      current.errors = e.info.errors;
    }

    return processed.concat(current);
  }, []);

  if (!processedItems.length) return [];

  const { merged } = processedItems[processedItems.length - 1];

  if (merged.errors?.length) {
    throw new BadRequest('merged entries are invalid', { info: { errors: merged.errors } });
  }

  return processedItems.map(({ clean }) => clean);
}
