import _ from 'lodash';
import { knex, schemas, interfaces } from '../config';
import Messages from '../Messages';

export default async function populateLatestMessage( entities, inbox ) {
  if ( entities === null ) {
    return null;
  }

  if ( !Array.isArray( entities ) ) {
    return (await populateLatestMessage( [ entities ], inbox ))[ 0 ];
  }

  const messages = await new Messages( { inbox } )
    .list( { id: _.uniq( entities.map( v => v.latestMessageId ) ) }, { latest: true } );

  return entities.map( row => {
    const id = row.latestMessageId;
    delete row.latestMessageId;

    return {
      ...row,
      latestMessage: _.find( messages.data, { id } ) || null
    };

  } );
}
