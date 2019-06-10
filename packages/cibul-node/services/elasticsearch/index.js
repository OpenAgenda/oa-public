"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const ESNode = require( '@openagenda/es-node' );

const coms = require( '../../lib/coms' );
const refresh = require( './lib/refresh' );
const resync = require( './lib/resync' );
const updateReview = require( './lib/updateReview' );
const updateEvent = require( './lib/updateEvent' );

let legacyES;

const LIMIT = 20;

module.exports = {
  init
}

function init( config ) {

  const legacyLib = ESNode( config.es );

  legacyES = {
    refreshIndex: promisify( legacyLib.refreshIndex ),
    resetIndex: promisify( legacyLib.resetIndex ),
    updateReview: updateReview( {
      update: promisify( legacyLib.reviews().update ),
      knex: config.knex
    } ),
    updateEvent: updateEvent( {
      update: promisify( legacyLib.events().update ),
      knex: config.knex,
      imageBasePath: config.aws.imageBucketPath
    } ),
    searchReviews: promisify( legacyLib.reviews().search ),
    searchEvents: promisify( legacyLib.events().search ),
  }

  Object.assign( module.exports, {
    agendas: agendas.bind( null, legacyLib ),
    search: search.bind( null, legacyLib ),
    searchAgendas: search.bind( null, legacyLib ),
    resync: resync.bind( null, legacyES ),
    refresh: refresh.bind( null, legacyES ),
    updateEvent: legacyES.updateEvent,
    removeEvent: legacyES.removeEvent
  } )

}

function agendas( legacyLib, agenda ) {

  return {
    search: _search,
    aggregate: _aggregate,
    resync: _resync
  }

  function _search( query, options, cb ) {

    if ( !cb ) {
      cb = options;
      options = {};
    }

    search( legacyLib, query, _.extend( {
      agendaId: agenda.id
    }, options ), cb );

  }

  function _aggregate( query, options, cb ) {

    if ( !cb ) {
      cb = options;
      options = {};
    }

    aggregate( legacyLib, query, _.extend( {
      agendaId: agenda.id
    }, options ), cb );

  }

  function _resync( cb ) {

    resync( legacyES, { agendaId: agenda.id }, err => {

      if ( err ) return cb( err );

      coms.publish( config.mainChannel, {
        name: 'agenda.update',
        values: {
          id: agenda.id,
          type: 'refresh'
        }
      } );

      cb();

    } );

  }

}


function searchAgendas( legacyLib, query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  _prepare( query, options, function( params, esQuery ) {

    esQuery.deep = true;
    esQuery.when = false;

    legacyLib.reviews().search( esQuery, cb );

  });

}


function aggregate( legacyLib, query, options, cb ) {

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  _prepare( query, options, function( params, esQuery ) {

    legacyLib.events().aggregate( esQuery, cb );

  });

}


function search( legacyLib, query, options, cb ) {

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  _prepare( query, options, ( params, esQuery ) => {

    legacyLib.events().search( esQuery, ( err, result ) => {

      if ( err ) return cb( err );

      cb( null, {
        total: result.total,
        events: result.data
      } );

    } );

  });

}


function _prepare( query, options, cb ) {

  const params = _.extend( {
    limit: LIMIT,
    agendaId: false,
    showAll: false
  }, options );

  const esQuery = _buildESQuery(
    _clean( query, params ),
    params.limit,
    params.agendaId,
    params.showAll
  );



  cb( params, esQuery );

}


function _buildESQuery( query, limit, agendaId, showAll ) {

  var when,

  esQuery = {
    options : {
      from : query.offset,
      size : limit,
      order : [ 'upcoming' ]
    },
    when : {
      type : 'upcoming'
    }
  };

  if ( agendaId ) {

    esQuery.reviewId = agendaId;

    esQuery.options.order = [ 'featured', 'upcoming' ];

  }

  [
    'tags',
    'category',
    'org',
    'what',
    'slug',
    'scope',
    'countryCode',
    'type',
    'accessibility',
    'lang',
    'age',
    'uids'
  ].forEach( function( name ) {

    if ( query[ name ] ) esQuery[ name ] = query[ name ];

  });


  if ( query.featured !== undefined ) {

    esQuery.featured = !!query.featured;

  }

  if ( query.when.length == 1 ) {

    esQuery.when = {
      type: 'date',
      value: new Date( _.get( query, 'when.0', '' ).replace( ' ', '+' ) ).toJSON(),
      withTime: query.when[0].indexOf( 'T' ) !== -1
    };

  } else if ( query.when.length == 2 ) {

    esQuery.when = {
      type: 'period',
      value: {
        start: new Date( _.get( query, 'when.0', '' ).replace( ' ', '+' ) ).toJSON(),
        end: new Date( _.get( query, 'when.1', '' ).replace( ' ', '+' ) ).toJSON(),
      },
      withTime: query.when[0].indexOf( 'T' ) !== -1
    };

  } else if ( query.passed || query.when === false ) {

    delete esQuery.when;

  }


  // where

  if ( query.location ) {

    esQuery.location = query.location;

  } else if ( query.locationExtId ) {

    esQuery.locationExtId = query.locationExtId;

  } else if ( query.lat && query.lng && query.radius ) {

    esQuery.where = {
      distance: query.radius + 'km',
      value: [
        parseFloat( query.lng ),
        parseFloat( query.lat )
      ]
    };

  } else if ( _validLatitude( query.neLat ) && _validLongitude( query.neLng ) && _validLatitude( query.swLat ) && _validLongitude( query.swLng ) ) {

    esQuery.where = {
      neLat: query.neLat,
      neLng: query.neLng,
      swLat: query.swLat,
      swLng: query.swLng
    }

  }


  // then "order"

  if ( query.order ) {

    esQuery.options.order = [ query.order ];

  }

  // show all events or not

  esQuery.showAll = !!showAll;

  return esQuery;

}


/**
 * cleans query params prior
 * to building es query
 */

function _clean( query, params ) {

  if ( params.offset === undefined ) {

    params.offset = ( parseInt( params.page ? params.page : 1, 10 ) - 1 ) * params.limit;

  }

  var clean = {
    when: [],
    offset: params.offset
  };


  if ( !query ) return clean;

  [ 'what', 'type', 'age', 'scope', 'slug' ].forEach( k => {

    if ( !query[ k ] ) return;

    clean[ k ] = query[ k ];

  });


  if ( query.uids && !query.from ) {

    clean.when = false;

  } else if ( query.from ) {

    clean.when = [ query.from ];

    if ( query.to && ( query.to !== query.from ) ) {

      clean.when.push( query.to );

    }

  } else if ( _isTruthy( query.passed ) ) {

    clean.passed = true;

  }


  if ( query.uids ) {

    let uids = [];

    // large arrays seem to be considered as objects. They must be reconverted to arrays
    if ( _.isArray( query.uids ) ) {

      uids = query.uids;

    } else if ( _.isObject( query.uids ) ) {

      Object.keys( query.uids ).forEach( k => {

        uids.push( query.uids[ k ] );

      } );

    } else {

      uids = [ query.uids ];

    }

    clean.uids = uids.map( uid => parseInt( uid ) );

  }


  if ( query.featured !== undefined ) {

    clean.featured = parseInt( query.featured, 10 );

    if ( isNaN( clean.featured ) ) {

      delete clean.featured;

    }

  }


  [ 'tags', 'accessibility', 'lang' ].forEach( k => {

    if ( !query[ k ] ) return;

    clean[ k ] = [].concat( query[ k ] );

  } );


  if ( [ 'proximity', 'update', 'upcoming', 'latest' ].indexOf( query.order ) !== -1 ) {

    clean.order = query.order;

  }

  [
    'neLat', 'neLng', 'swLat', 'swLng',
    'category', 'location', 'locationExtId', 'org',
    'countryCode'
  ].forEach( function( name ) {

    if ( query[ name ] ) clean[ name ] = query[ name ];

  } );

  return clean;

}


function _validLatitude( lat ) {

  if ( !_validCoord( lat ) ) return false;

  if ( parseFloat( lat ) > 90 ) return false;

  if ( parseFloat( lat ) < -90 ) return false;

  return true;

}

function _validLongitude( lng ) {

  if ( !_validCoord( lng ) ) return false;

  if ( parseFloat( lng ) > 180 ) return false;

  if ( parseFloat( lng ) < -180 ) return false;

  return true;

}

function _validCoord( coord ) {

  if ( typeof coord == 'undefined' ) return false;

  if ( !coord ) return false;

  if ( /,/.test( coord ) ) return false;

  if ( isNaN( coord ) ) return false;

  return true;

}

function _isTruthy( v ) {

  if ( typeof v === 'boolean' ) return v;

  if ( typeof v === 'string' && v === 'true' ) return true;

  if ( typeof v === 'string' && v === 'false' ) return false;

  return !!parseInt( v );

}
