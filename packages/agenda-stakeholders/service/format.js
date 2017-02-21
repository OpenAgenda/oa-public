"use strict";

// tests at test/format
const _ = require( 'lodash' ),

  slug = require( 'slug' ),

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
  dbToObj,
  objToDb
}

function objToDb( obj, filterNull = false ) {

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

    let custom = _.mapKeys( obj.custom, ( v, k ) => _.snakeCase( k ) );

    entry.store = JSON.stringify( {
      custom_fields: custom
    } );

    // legacy exception
    if ( typeof obj.custom.organization === 'object' ) {

      entry.organization = obj.custom.organization.slug;

    } else if ( typeof obj.custom.organization === 'string' ) {

      entry.organization = slug( obj.custom.organization, { lower: true } );

    }

  }

  if ( filterNull ) {

    let filtered = {};

    Object.keys( entry ).forEach( k => {

      if ( entry[ k ] !== null && entry[ k ] !== undefined ) filtered[ k ] = entry[ k ];

    } );

    return filtered;

  }

  return entry;

}

function dbToObj( entry, options = {} ) {

  let obj = {
    id: null, 
    agendaId: null,
    userId: null,
    credential: null,
    updatedAt: null,
    createdAt: null,
    custom: {}
  },

  store = {},

  params = _.extend( {
    showSlugs: true
  }, options );

  if ( !entry || typeof entry !== 'object' ) {

    return obj;

  }

  correspondance.forEach( c => {

    obj[ c.obj ] = entry[ c.db ];

  } );

  try {

    store = JSON.parse( entry.store || '{}');

  } catch( e ) {}

  if ( !store.custom_fields ) {

    return obj;

  }

  obj.custom = _.mapKeys( store.custom_fields, ( v, k ) => _.camelCase( k ) );

  if ( entry.organization && typeof obj.custom.organization === 'string' ) {

    _legacyDbToObj( entry, obj );

  }

  if ( typeof obj.custom.organization === 'object' && !params.showSlugs ) {

    obj.custom.organization = obj.custom.organization.label;

  }

  return obj;

}

function _legacyDbToObj( entry, obj ) {

  obj.custom.organization = {
    label: obj.custom.organization,
    slug: entry.organization
  }

}