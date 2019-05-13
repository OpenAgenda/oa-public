"use strict";

const _ = require( 'lodash' );

const map = {
  id: 'id',
  credential: 'role',
  agenda_uid: 'agendaUid',
  user_uid: 'userUid',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const dbFields = Object.keys( map );

module.exports = entry => {

  if ( !entry ) return null;

  return Object.keys( entry )
    .filter( field => dbFields.includes( field ) )
    .reduce( ( mapped, field ) => _.set( mapped, map[ field ], null ), {} );

}
