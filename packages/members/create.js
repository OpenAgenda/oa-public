import logs from '@openagenda/logs';
import validate from './iso/validate.js';
import toRoleCode from './iso/toRoleCode.js';
import cleanCreateOptions from './lib/cleanCreateOptions.js';
import { toDB } from './lib/transformDBEntry.js';

const log = logs('create');

export default async ({ knex, schema, interfaces }, data, options = {}) => {
  log('processing', data);

  const { requireCustom, context } = cleanCreateOptions(options);

  const clean = {};

  data.role = toRoleCode(data.role);

  try {
    Object.assign(clean, validate.withCustom(requireCustom)(data), {
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (errors) {
    return {
      success: false,
      errors,
    };
  }

  if (clean.agendaUid && interfaces.getAgendasByUid) {
    clean.agendaId = (await interfaces.getAgendasByUid(clean.agendaUid))[0]?.id;
  }

  if (clean.userUid && interfaces.getUsersByUid) {
    clean.userId = (await interfaces.getUsersByUid(clean.userUid))[0]?.id;
  }

  clean.invited = !clean.userUid;

  if (clean.userUid && clean.agendaUid) {
    if (
      await knex(schema)
        .first('id')
        .where('user_uid', clean.userUid)
        .where('agenda_uid', clean.agendaUid)
    ) {
      throw new Error('Already exists');
    }
  }

  log('inserting member', clean);

  [clean.id] = await knex(schema).insert(toDB(clean));

  if (interfaces?.onCreate) {
    try {
      await interfaces.onCreate(clean, context);
    } catch (e) {
      log('error', 'interface onCreate exception for member %s', clean.id, e);
    }
  }

  return {
    errors: [],
    success: true,
    member: clean,
  };
};
