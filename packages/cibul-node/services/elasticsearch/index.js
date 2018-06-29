"use strict";

const _ = require( 'lodash' );

const config = require( '../../config' ),

legacyLib = require( '@openagenda/es-node' )( config.es ),

lib = require( '../../lib/lib' ),

c = require( './lib/clean' ),

coms = require( '../../lib/coms' ),

resync = require( './lib/resync' ),

refresh = require( './lib/refresh' ),

LIMIT = 20;

resync.set( legacyLib );

refresh.set( legacyLib );

module.exports = {
  initless: true,
  agendas,
  search,
  searchAgendas,
  resync,
  refresh
}

function agendas( agenda ) {

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

    search( query, lib.extend( {
      agendaId: agenda.id
    }, options ), cb );

  }

  function _aggregate( query, options, cb ) {

    if ( !cb ) {

      cb = options;

      options = {}

    }

    aggregate( query, lib.extend( {
      agendaId: agenda.id
    }, options ), cb );

  }

  function _resync( cb ) {

    resync( { agendaId: agenda.id }, err => {

      if ( !err ) {

        coms.publish( config.mainChannel, {
          name: 'agenda.update',
          values: {
            id: agenda.id,
            type: 'refresh'
          }
        } );

      }

      cb( err );

    } );

  }

}


function searchAgendas( query, options, cb ) {

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


function aggregate( query, options, cb ) {

  if ( arguments.length == 2 ) {

    cb = options;

    options = {};

  }

  _prepare( query, options, function( params, esQuery ) {

    legacyLib.events().aggregate( esQuery, cb );

  });

}


function search( query, options, cb ) {

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

  var params = lib.extend( { 
    limit: LIMIT,
    agendaId: false,
    showAll: false
  }, options ),

  esQuery = _buildESQuery(
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
      value: new Date( query.when[0] ).toJSON()
    };

  } else if ( query.when.length == 2 ) {

    esQuery.when = {
      type: 'period',
      value: {
        start: new Date( query.when[ 0 ] ).toJSON(),
        end: new Date( query.when[ 1 ] ).toJSON()
      }
    };

  } else if ( query.passed || query.when === false ) {

    delete esQuery.when;

  }


  // where
  
  if ( query.location ) {

    esQuery.location = query.location;

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

  [ 'what', 'type', 'age', 'scope' ].forEach( k => {

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

    clean[ k ] = c.parseQueryList( query[ k ] );

  });


  if ( [ 'proximity', 'update', 'upcoming', 'latest' ].indexOf( query.order ) !== -1 ) {

    clean.order = query.order;

  }

  [ 
    'neLat', 'neLng', 'swLat', 'swLng', 
    'category', 'location', 'org', 
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