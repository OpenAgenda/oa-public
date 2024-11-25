import logs from '@openagenda/logs';
import clean from './clean.js';

const log = logs('extractRules');

export default function extract(type, identifier, store) {
  if (!store) return [];

  try {
    const { rules } = JSON.parse(store);
    return clean(rules);
  } catch (e) {
    log('error', 'failed to parse %s store (%s)', type, identifier, e);
  }
}
