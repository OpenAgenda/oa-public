'use strict';

const log = require( '@openagenda/logs' )( 'location type' );

var utils = require( '@openagenda/utils' ),

states = require( '../states' ),

config = {};

module.exports.init = function( cfg ) {

  config = utils.extend( {
    imagePath: false
  }, cfg );

}

module.exports.mapping = {

  properties: {

    id: {
      type: 'integer',
      index: 'not_analyzed'
    },

    uid: {
      type: 'integer',
      index: 'not_analyzed'
    },

    agendaId: {
      type: 'integer',
      index: 'not_analyzed'
    },

    latitude: {
      type: 'long',
      index: 'not_analyzed'
    },

    longitude: {
      type: 'long',
      index: 'not_analyzed'
    },

    name: {
      type: 'string',
      analyzer: 'custom'
    },

    address: {
      type: 'string',
      analyzer: 'custom'
    },

    description: {
      type: 'string',
      index: 'not_analyzed'
    },

    countryCode: {
      type: 'string',
      analyzer: 'custom'
    },

    region: {
      type: 'string',
      analyzer: 'custom'
    },

    department: {
      type: 'string',
      analyzer: 'custom'
    },

    extId: {
      type: 'string',
      analyzer: 'custom'
    },

    district: {
      type: 'string',
      analyzer: 'custom'
    },

    timezone: {
      type: 'string',
      index: 'not_analyzed'
    },

    postalCode: {
      type: 'string'
    },

    insee: {
      type: 'string',
      index: 'not_analyzed'
    },

    state: {
      type: 'integer',
      index: 'not_analyzed'
    },

    updatedAt: {
      type: 'date'
    },

    geo_es : {
      type: 'geo_point'
    },

    suggestions: {
      type: 'nested',
      index: 'not_analyzed'
    }

  }

}


module.exports.query = function( q, offset, limit ) {

  var dsl = {
    sort: {
      updatedAt: {
        order: 'desc'
      }
    },
    _source: { exclude: [ '*_es' ] }
  },

  filters = [],

  query = {};

  if ( offset || limit ) {

    utils.extend( dsl, {
      from: offset,
      size: limit
    } );

  }

  // single value match
  [ 'agendaId', 'uid', 'id', 'state' ].forEach( t => {

    if ( q[ t ] === undefined ) return;

    let f = { term: {} };

    f.term[ t ] = q[ t ];

    filters.push( f );

  } );


  // multiple values match
  [ 'uids:uid' ].forEach( t => {

    let s = t.split( ':' )[ 0 ],

    d = t.split( ':' )[ 1 ];

    if ( q[ s ] === undefined ) return;

    if ( !utils.isArray( q[ s ] ) ) return;

    let f = { terms: {} };

    f.terms[ d ] = q[ s ];

    filters.push( f );

  } );


  if ( q.updatedAt ) {

    let rangeFilter = {};

    [ '$lt', '$lte', '$gt', '$gte' ].forEach( op => {

      if ( q.updatedAt[ op ] !== undefined ) {

        rangeFilter[ op.substr( 1 ) ] = q.updatedAt[ op ];

      }

    } );

    if ( Object.keys( rangeFilter ).length ) {

      filters.push( {
        range: {
          updatedAt: rangeFilter
        }
      } );

    }

  }

  if ( q.search && q.search.length ) {

    query.multi_match = {
      query : q.search,
      type : 'cross_fields',
      operator : 'and',
      fields : [
        'name', 'address', 'city',
        'countryCode', 'region',
        'department', 'district',
        'postalCode', 'extId'
      ]
    }

  }

  if ( q.box ) {

    if ( typeof q.box !== 'object' || !q.box.topLeft || !q.box.bottomRight ) {

      log( 'error', 'missing corners for bounding box search' );

    } else {

      filters.push( {
        geo_bounding_box: {
          geo_es: {
            top_left: {
              lat: q.box.topLeft[ 0 ],
              lon: q.box.topLeft[ 1 ]
            },
            bottom_right: {
              lat: q.box.bottomRight[ 0 ],
              lon: q.box.bottomRight[ 1 ]
            }
          }
        }
      } );

    }

  }


  if ( !utils.size( query ) ) {

    query = { match_all: {} };

  }

  if ( filters.length ) {

    dsl.query = {
      filtered: {
        query: query,
        filter: {
          bool: {
            must: filters
          }
        }
      }
    }

  } else {

    dsl.query = query;

  }

  return dsl;

}


/**
 * clean data prior to read
 */
module.exports.parse = function( l ) {

  try {

    l.description = l.description ? JSON.parse( l.description ) : null;

    l.access = l.access ? JSON.parse( l.access ) : null;

  } catch( e ) {}


  return l;

}


/**
 * clean data prior to write in index
 */
module.exports.clean = function( l, refreshUpdatedAt ) {

  return {
    id: l.id,
    uid: l.uid,
    name: l.name,
    agendaId: l.agendaId || null,
    state: l.state === undefined ? states.verified : l.state,
    image: _cleanImage( l ),
    latitude: l.latitude,
    longitude: l.longitude,
    address: l.address,
    description: JSON.stringify( l.description ) || null,
    city: l.city,
    countryCode: l.countryCode || l.country,
    region: l.region,
    department: l.department,
    extId: l.extId,
    district: l.district,
    postalCode: l.postalCode,
    website: l.website,
    timezone: l.timezone,
    links: l.links,
    phone: l.phone,
    email: l.email,
    imageCredits: l.imageCredits,
    access: JSON.stringify( l.access ) || null,
    updatedAt: refreshUpdatedAt ? new Date() : l.updatedAt,
    tags: l.tags ? l.tags : [],
    geo_es: {
      lat: l.latitude,
      lon: l.longitude
    }
  }

}


function _cleanImage( l ) {

  let image = undefined;

  if ( l.image && config.imagePath ) {

    image = ( l.image.indexOf( config.imagePath ) == -1 ? config.imagePath : '' ) + l.image;

  } else if ( l.image === null ) {

    image = null;

  }

  return image;

}
