import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import get from './get.js';
import validate from './iso/validate.js';
import cleanPatchOptions from './lib/cleanPatchOptions.js';
import { toDB } from './lib/transformDBEntry.js';
import invalidateListCache from './lib/invalidateListCache.js';

const log = logs('patch');

async function patch(config, identifiers, data, options = {}) {
  log('processing', data);

  const { knex, schema, interfaces } = config;

  const { requireCustom, context, throwOnError } = cleanPatchOptions(options);

  const clean = {};

  const member = await get(config, identifiers, { legacy: true });

  if (!member) throw new Error('Not found');

  try {
    Object.assign(
      clean,
      validate.withCustom(requireCustom).part(Object.keys(data), data),
      { updatedAt: new Date() },
    );
  } catch (errors) {
    if (throwOnError) {
      throw new BadRequest({ info: { errors } }, 'submitted data is invalid');
    }
    return {
      success: false,
      errors,
    };
  }

  log('patching', clean);

  await knex(schema).update(toDB(clean)).where('id', member.id);

  await invalidateListCache(config, member.agendaUid);

  const patched = await get(config, member.id, { legacy: true });

  if (interfaces?.onPatch) {
    try {
      await interfaces.onPatch(member, patched, context);
    } catch (e) {
      log('error', 'interface onPatch exception for member %s', member.id, e);
    }
  }

  return {
    success: true,
    errors: [],
    member: patched,
  };
}

async function actionsIncrement(config, identifiers) {
  const member = await get(config, identifiers);

  return patch(config, identifiers, {
    actionsCounter: (member?.actionsCounter ?? 0) + 1,
  });
}

export default Object.assign(patch, {
  actionsIncrement,
});
