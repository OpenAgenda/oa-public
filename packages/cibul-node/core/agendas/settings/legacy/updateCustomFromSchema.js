import _ from 'lodash';
import { utils } from '@openagenda/legacy/tagsAndCustom/index.js';
import logs from '@openagenda/logs';
import getAgenda from '../../utils/getAgenda.js';
import getMergedSchema from '../getMergedSchema.js';
import setSchemaFieldOrigins from './setSchemaFieldOrigins.js';

const { generateCustomSet } = utils;

const log = logs('core/agendas/settings/legacy/updateCustom');

export default async (core, agendaOrUid, force = false) => {
  const { services } = core;

  const config = core.getConfig();

  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);

  log('transferring from form-schema to custom fields', agenda.uid);

  // get the merged one.
  const schema = await getMergedSchema(services, agenda);

  if (!schema) {
    return {
      message: `No form schema was found for agenda ${agenda.uid}`,
    };
  }

  const { customFields, messages } = generateCustomSet(schema);

  const { store } = await config
    .knex('review')
    .first(['id', 'store'])
    .where('uid', agenda.uid);

  const parsedStore = JSON.parse(store) || {};

  if (!force && _.get(parsedStore, 'customFields', []).length) {
    return {
      message:
        'custom fields already exist for agenda. ?force to force operation',
    };
  }

  parsedStore.customFields = customFields;

  await config
    .knex('review')
    .update({
      store: JSON.stringify(parsedStore),
    })
    .where('uid', agenda.uid);

  messages.push('generated customFields');

  const res = {
    messages,
    customFields,
  };

  if (customFields.length) {
    const { message: schemaUpdateMessage, schema: updatedSchema } = await setSchemaFieldOrigins(
      services,
      agenda,
      customFields.map((f) => f.name),
      'custom',
    );

    res.messages.push(schemaUpdateMessage);

    res.updatedSchema = updatedSchema;
  }

  return res;
};
