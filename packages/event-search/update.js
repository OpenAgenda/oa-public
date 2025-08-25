import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import formatEvent from './utils/formatEvent.js';
import getDocumentId from './utils/getDocumentId.js';
import getIndexName from './utils/getIndexName.js';
import validateOptions from './utils/validateUpdateOptions.js';
import ESToVerror from './utils/ESToVerror.js';

const log = logs('update');

export default async function update(
  config,
  set,
  identifiers,
  eventPart,
  options = {},
) {
  const { refresh, formSchema, operation } = validateOptions(options);

  const { client, defaultIndex, interfaces } = config;

  if (!eventPart) {
    throw new BadRequest(
      {
        info: { set, identifiers },
      },
      'no data was provided',
    );
  }

  let result;

  try {
    const doc = {
      ...formatEvent(eventPart, { formSchema }),
      _set: set,
    };
    result = await client[operation]({
      index: getIndexName(set, defaultIndex),
      routing: set,
      body: operation === 'update' ? { doc } : doc,
      id: getDocumentId(set, identifiers.uid),
      refresh,
    });
  } catch (err) {
    throw ESToVerror(err, 'failed to update event');
  }

  let success = false;

  if (operation === 'update' && result.body.result === 'updated') {
    log('event %j was updated in set %s', identifiers, set, {
      operation: 'update',
      set,
      identifiers,
    });
    success = true;
  } else if (
    operation === 'index'
    && ['created', 'updated'].includes(result.body.result)
  ) {
    log('event %j was %s in set %s', identifiers, result.body.result, set, {
      operation,
      set,
      identifiers,
    });
    success = true;
  } else {
    log(
      'warn',
      'event %j was not %s in set %s',
      identifiers,
      operation === 'update' ? 'updated' : 'indexed',
      set,
      {
        operation,
        set,
        identifiers,
      },
    );
  }

  if (success) {
    if (interfaces?.onUpdate) {
      try {
        interfaces.onUpdate({ identifiers, set });
      } catch (e) {
        // console.log(e);
      }
    }
  }

  return {
    success,
  };
}
