"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

const roles = require( './roles' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  choice: require( '@openagenda/validators/choice' ),
  text: require( '@openagenda/validators/text' ),
  boolean: require( '@openagenda/validators/boolean' )
} );

const validate = schema( {
  id: {
    type: 'integer',
    list: {
      default: null
    }
  },
  agendaUid: {
    type: 'integer'
  },
  userUid: {
    type: 'integer'
  },
  withUser: {
    type: 'boolean',
    default: null
  },
  deletedUser: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  withActions: {
    type: 'boolean',
    default: null
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
  },
  search: {
    type: 'text',
    max: 255
  }
} );

module.exports = ( k, query ) => {

  const legacyParts = _extractLegacyParts( query );

  const {
    id,
    agendaUid,
    userUid,
    role,
    search,
    withUser,
    deletedUser,
    withActions
  } = validate( Object.keys( legacyParts ).length ? Object.assign( {}, query, legacyParts ) : query );

  if ( !agendaUid && !userUid && !id ) {
    throw new Error( 'neither agendaUid or userUid are specified' );
  }

  if ( agendaUid ) {
    k.where( 'agenda_uid', agendaUid );
  }

  if ( id ) {
    k.whereIn( 'id', id );
  }

  if ( userUid ) {
    k.where( 'user_uid', userUid );
  }

  if ( withUser === true ) {
    k.whereNotNull( 'user_uid' );
  } else if ( withUser === false ) {
    k.whereNull( 'user_uid' );
  }

  if ( deletedUser === true ) {
    k.where( 'deleted_user', true );
  } else if ( deletedUser === false ) {
    k.where( 'deleted_user', false );
  }

  if ( withActions === true ) {
    k.where( 'actions', '>', 0 );
  } else if ( withActions === false ) {
    k.where( 'actions', '=', 0 );
  }

  if ( search ) {
    k.andWhere( 'store', 'like', `%${search}%` );
  }

  if ( role.length ) {
    k.whereIn( 'credential', role.map( r => _.isInteger( r ) ? r : roles[ r.toUpperCase() ] ) )
  }

}

function _extractLegacyParts( query ) {

  const legacyParts = {}

  if ( _.get( query, 'credentials' ) ) {
    legacyParts.role = _.get( query, 'credentials' );
  }

  return legacyParts;

}
