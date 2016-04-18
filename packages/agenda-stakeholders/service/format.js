"use strict";

// tests at test/format

const utils = require( 'utils' ),

correspondance = [ {
  db: 'review_id',
  obj: 'agendaId'
}, {
  db: 'user_id',
  obj: 'userId'
}, {
  db: 'id',
  obj: 'id'
}, {
  db: 'credential',
  obj: 'credential'
}, {
  db: 'updated_at',
  obj: 'updatedAt'
}, {
  db: 'created_at',
  obj: 'createdAt'
} ];

module.exports = {
  dbToObj: dbToObj,
  objToDb: objToDb
}

function objToDb( obj ) {

  let entry = {
    review_id: null,
    user_id: null,
    credential: null,
    store: null,
    organization: null,
    created_at: null,
    updated_at: null
  };

  correspondance.forEach( c => {

    entry[ c.db ] = obj[ c.obj ];

  } );

  if ( obj.custom ) {

    let custom = {};

    Object.keys( obj.custom ).forEach( k => {

      custom[ utils.toUnderscore( k ) ] = obj.custom[ k ];

    } );

    entry.store = JSON.stringify( {
      custom_fields: custom
    } );

    // legacy exception
    if ( typeof obj.custom.organization === 'object' ) {

      entry.organization = obj.custom.organization.slug;

    }

  }

  return entry;

}

function dbToObj( entry ) {

  let obj = {
    id: null, 
    agendaId: null,
    userId: null,
    credential: null,
    updatedAt: null,
    createdAt: null,
    custom: {}
  },

  store = {};

  if ( !entry || typeof entry !== 'object' ) {

    return obj;

  }

  correspondance.forEach( c => {

    obj[ c.obj ] = entry[ c.db ];

  } );

  try {

    store = JSON.parse( entry.store || '{}');

  } catch( e ) {}

  if ( !store.custom_fields ) return obj;

  Object.keys( store.custom_fields ).forEach( k => {

    obj.custom[ utils.toCamelCase( k ) ] = store.custom_fields[ k ];

  } );

  if ( entry.organization && typeof obj.custom.organization === 'string' ) {

    _legacyDbToObj( entry, obj );

  }

  return obj;

}

function _legacyDbToObj( entry, obj ) {

  obj.custom.organization = {
    label: obj.custom.organization,
    slug: entry.organization
  }

}