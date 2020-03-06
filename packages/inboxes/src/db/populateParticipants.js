import _ from 'lodash';
import mapper from '../utils/mapper';
import populateDetails from './populateDetails';
import inboxFieldsMap from './inboxFieldsMap';

export default async function populateParticipants(svc, entities) {
  const { knex, schemas } = svc.config;

  if (entities === null) {
    return null;
  }

  if (!Array.isArray(entities)) {
    return (await populateParticipants(svc, [entities]))?.[0];
  }

  const ids = entities.map(v => v.id);

  // request all inboxes of all conversations
  let result = await knex(schemas.inboxConversation)
    .select()
    .column(`${schemas.inboxConversation}.conversation_id as conversationId`)
    .column(
      mapper
        .listFields(inboxFieldsMap, 'select', 'db', {}, true, 'inbox.')
        .map(v => `${schemas.inbox}.${v}`)
    )
    .leftJoin(
      schemas.inbox,
      `${schemas.inbox}.id`,
      `${schemas.inboxConversation}.inbox_id`
    )
    .whereIn('conversation_id', ids)
    .map(row => _.reduce(row, (r, value, key) => _.set(r, key, value), {}));

  result = _.groupBy(await populateDetails(svc, result), 'conversationId');

  return entities.map(v => (result[v.id]
    ? {
      ...v,
      inboxes: result[v.id].map(w => w.inbox)
    }
    : v));
}
