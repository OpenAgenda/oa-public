import { BadRequest } from '@openagenda/verror';
import debug from 'debug';

import { getCurrentValue, getObjectType } from '../utils.js';
import validateMergedLocalData from './validateMergedLocalData.js';
import validateEventOffer from './validateEventOffer.js';
import { validateDates } from './validateDate.js';
import { validatePriceCategories } from './validatePriceCategory.js';

const log = debug('validateSpreadLocalData');

export default function validateSpreadLocalData(data, event, params = {}) {
  log('validating data at each new entry step for %s entries', data.length);
  const processedItems = data.reduce((processed, entry, index) => {
    const isApplied = !!entry.appliedAt;
    log('adding entry %s', index);
    const current = { merged: {} };

    if (!params.categories) {
      throw new Error('categories are required for event offer validation');
    }

    current.merged.value = getCurrentValue(
      processed.map(({ clean }) => clean).concat(entry),
    );

    try {
      current.merged.clean = isApplied
        ? current.merged.value
        : validateMergedLocalData(current.merged.value, event, params);
    } catch (error) {
      current.merged.errors = error.info.errors;
    }

    if (current.merged.errors) {
      log(
        '  compiled data is invalid OR incomplete at step %s',
        index,
        current.merged.errors,
      );
    } else {
      log('  compiled data is valid at step %s', index, {
        merged: current.merged,
      });
    }

    const type = getObjectType(entry); // eventOffer, dates ou priceCategories

    log('  evaluating entry', { type, entry });

    const cleanEntry = isApplied
      ? entry
      : {
        ...entry.response ? { response: entry.response } : undefined,
        ...entry.appliedAt ? { appliedAt: entry.appliedAt } : undefined,
        ...entry.operation ? { operation: entry.operation } : undefined,
      };

    try {
      if (type === 'eventOffer') {
        Object.assign(
          cleanEntry,
          validateEventOffer(entry, { ...params, partial: true }),
        );
      } else if (type === 'priceCategories') {
        cleanEntry.priceCategories = validatePriceCategories(
          entry.priceCategories,
        );
      } else if (type === 'dates') {
        cleanEntry.dates = validateDates(
          entry.dates,
          current.merged.clean?.priceCategories
            ?? current.merged.value?.priceCategories,
          event,
        );
      }
    } catch (e) {
      if (!e.info?.errors) {
        log('exception on entry evaluation', { error: e, entry });
        throw e;
      }
      log('entry has local validation errors', e.info);
      Object.assign(current, {
        errors: e.info.errors,
        clean: cleanEntry,
      });
    }

    if (!Object.keys(cleanEntry).length && !current.errors) {
      return processed;
    }

    return processed.concat({ ...current, clean: cleanEntry });
  }, []);

  if (!processedItems.length) return [];

  const { merged } = processedItems[processedItems.length - 1];

  log('merge of spread data', merged);

  if (merged.errors?.length) {
    throw new BadRequest(
      { info: { errors: merged.errors } },
      'entries are invalid or incomplete',
    );
  }

  return processedItems.map(({ clean }) => clean);
}
