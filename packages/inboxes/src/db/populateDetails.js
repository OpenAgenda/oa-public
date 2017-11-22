import _ from 'lodash';
import { interfaces } from '../config';

export default async function populateDetails( entities, inbox ) {
  if ( entities === null ) {
    return null;
  }

  if ( !Array.isArray( entities ) ) {
    return (await populateDetails( [ entities ], inbox ))[ 0 ];
  }

  const result = await Promise.all( entities.map( async row => {
    if ( row.inboxUserId ) {
      delete row.inboxUserId;
    }

    if ( row.inboxUser && row.inboxUser.inboxId !== inbox.data.id ) {
      delete row.inboxUser;
    }

    return row;
  } ) );

  const listsToPopulate = result.reduce( ( result, row ) => {
    if ( row.inboxUser ) {
      result.users.push( row.inboxUser );
    }
    if ( row.inbox ) {
      result.inboxes.push( row.inbox );
    }

    return result;
  }, { users: [], inboxes: [] } );

  listsToPopulate.users = _.uniqWith( listsToPopulate.users, _.isEqual );
  listsToPopulate.inboxes = _.uniqWith( listsToPopulate.inboxes, _.isEqual );

  const usersDetails = await interfaces.getUsersDetails( listsToPopulate.users );
  const inboxesDetails = await interfaces.getInboxesDetails( listsToPopulate.inboxes );

  return result.map( entity => {
    let userIndex = usersDetails.findIndex( v => entity.inboxUser && entity.inboxUser.userUid === v.uid );
    let inboxIndex = inboxesDetails.findIndex( v => entity.inbox && entity.inbox.identifier === v.uid );

    if ( ~userIndex ) {
      Object.assign( entity.inboxUser, usersDetails[ userIndex ] );
    }
    if ( ~inboxIndex ) {
      Object.assign( entity.inbox, inboxesDetails[ inboxIndex ] );
    }

    return entity;
  } );
}