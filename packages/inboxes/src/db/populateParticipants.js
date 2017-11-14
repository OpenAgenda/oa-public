import _ from 'lodash';
import { knex, schemas, interfaces } from '../config';
import mapper from '../utils/mapper';
import populateDetails from './populateDetails';
import inboxFieldsMap from './inboxFieldsMap';

export default async function populateParticipants( entities ) {
  if ( entities === null ) {
    return null;
  }

  if ( !Array.isArray( entities ) ) {
    return (await populateParticipants( [ entities ] ))[ 0 ];
  }

  const ids = entities.map( v => v.id );

  // request all inboxes of all conversations
  let result = await knex( schemas.inboxConversation )
    .select()
    .column( `${schemas.inboxConversation}.conversation_id as conversationId` )
    .column(
      mapper.listFields( inboxFieldsMap, 'select', 'db', {}, true, 'inbox.' )
        .map( v => `${schemas.inbox}.${v}` )
    )
    .leftJoin(
      schemas.inbox,
      `${schemas.inbox}.id`,
      `${schemas.inboxConversation}.inbox_id`
    )
    .whereIn( 'conversation_id', ids )
    .map( row => _.reduce(
      row,
      ( r, value, key ) => _.set( r, key, value ),
      {}
    ) );

  result = _.groupBy( await populateDetails( result ), 'conversationId' );

  return entities.map( v => (
    result[ v.id ] ? {
      ...v,
      inboxes: result[ v.id ].map( w => w.inbox )
    } : v)
  );
}
