"use strict";

var config = require( '../../config' ),

legacyLib = require( 'ES' )( config.es ),

lib = require( '../../lib/lib' );

module.exports = {
  agendas: agendas,
  search: search
}

function agendas( agenda ) {

  return {
    search: agendaSearch
  }

  function agendaSearch( query, options, cb ) {

    if ( !cb ) {

      cb = options;

      options = {};

    }

    search( query, lib.extend( {
      agendaId: agenda.id
    }, options ), cb );

  }

}


function search( query, options, cb ) {

  var params = lib.extend( { 
    page: 1,
    limit: 20,
    agendaId: false,
    showAll: false
  }, options ),

  esQuery = _buildESQuery(
    _clean( query, params.page ),
    params.limit, 
    params.agendaId,
    params.showAll
  );

  legacyLib.events().search( esQuery, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, { 
      total: result.total, 
      events: result.data 
    } );

  } );

}


function _buildESQuery( query, limit, agendaId, showAll ) {

  var page, when,

  esQuery = {
    options : {
      from : ( query.page - 1 ) * limit,
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

  [ 'tags', 'category', 'org', 'what' ].forEach( function( name ) {

    if ( query[ name ] ) esQuery[ name ] = query[ name ];

  });

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

  } else if ( query.passed ) {

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

  } else if ( query.neLat && query.neLng && query.swLat && query.swLng ) {

    esQuery.where = {
      neLat: query.neLat,
      neLng: query.neLng,
      swLat: query.swLat,
      swLng: query.swLng
    }

  }


  // then "order"
  
  if ( query.order ) {

    esQuery.order = [ query.order ];

  }

  // show all events or not
  
  esQuery.showAll = !!showAll;

  return esQuery;

}


/**
 * cleans query params prior
 * to building es query
 */

function _clean( query, page ) {

  if ( page === undefined ) page = 1;

  var clean = {
    when: [],
    page: parseInt( page, 10 )
  };

  if ( !query ) return clean;

  if ( query.what ) clean.what = query.what;

  if ( query.from ) {

    clean.when = [ query.from ];

    if ( query.to && ( query.to !== query.from ) ) {

      clean.when.push( query.to );

    }

  } else if ( query.passed ) {

    clean.passed = true;

  }

  if ( query.tags && ( typeof query.tags == 'string' ) ) {

    clean.tags = [ query.tags ];

  } else if ( query.tags ) {

    clean.tags = query.tags;

  }

  if ( [ 'proximity', 'update', 'upcoming' ].indexOf( query.order ) !== -1 ) {

    clean.order = query.order;

  }

  [ 'neLat', 'neLng', 'swLat', 'swLng', 'category', 'location', 'org' ].forEach( function( name ) {

    if ( query[ name ] ) clean[ name ] = query[ name ];

  });

  return clean;

}