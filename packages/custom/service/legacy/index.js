import _ from 'lodash';
import config from '../config.js';
import set from './set.js';
import setAll from './setAll.js';

async function remove(formSchemaId, identifier) {
  const { knex } = config;
  const { schemas } = config.legacy;

  const { id: agendaId } = await knex(schemas.agenda)
    .first('id')
    .where('form_schema_id', formSchemaId);

  const { id: eventId } = await knex(schemas.event)
    .first('id')
    .where('uid', identifier);

  await knex(schemas.agendaEvent).delete().where({
    review_id: agendaId,
    event_id: eventId,
  });
}

export default _.extend(set, {
  remove,
  setAll: setAll.bind(null, config),
});
