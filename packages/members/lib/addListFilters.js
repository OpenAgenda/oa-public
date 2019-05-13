"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

const roles = require( './roles' );

schema.register( {
} );

const validate = schema( {
  agendaUid: {
    type: 'integer'
  },
  userUid: {
    type: 'integer'
  },
  role: {
    type: 'choice',
    options: [
      'administrator',
      'moderator',
      'contributor',
      'reader',
      roles.ADMINISTRATOR,
      roles.MODERATOR,
      roles.CONTRIBUTOR,
      roles.READER
    ]
  }
} );

module.exports = ( k, query ) => {

  const {
    agendaUid,
    userUid,
    role
  } = validate( query );

  if ( !_.get( cleanQuery, 'agendaUid' ) && !_.get( cleanQuery, 'userUid' ) ) {
    throw new Error( 'neither agendaUid or userUid are specified' );
  }

  if ( agendaUid ) {
    k.where( 'agenda_uid', agendaUid );
  }

  if ( userUid ) {
    k.where( 'user_uid', userUid );
  }

  if ( role.length ) {
    k.whereIn( 'credential', role.map( r => _.isInteger( r ) ? r : roles[ r.toUpperCase() ] )
  }

}
