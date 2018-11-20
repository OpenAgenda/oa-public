"use strict";

const _ = require( 'lodash' );

module.exports = ( cleanQuery, extensionQueries, additionalMustParts = [] ) => {

  const query = {};

  const mustParts = _getQueryMustParts( cleanQuery, extensionQueries ).concat( additionalMustParts );

  const filterParts = _getQueryFilterParts( cleanQuery );

  if ( mustParts.length === 1 && !filterParts.length ) {

    _.extend( query, mustParts[ 0 ] );

  } else if ( mustParts.length > 1 || ( filterParts.length && mustParts.length ) ) {

    _.set( query, 'bool.must', mustParts );

  }


  if ( filterParts.length ) {

    _.set( query, 'bool.filter', filterParts );

  }

  return query;   

}


function _getQueryFilterParts( cleanQuery ) {

  const parts = [];

  if ( _.get( cleanQuery, 'localTime.gte' ) || _.get( cleanQuery, 'localTime.lte' ) ) {

    parts.push( _localTime( cleanQuery.localTime ) );

  }

  if ( _.get( cleanQuery, 'date.gte' ) || _.get( cleanQuery, 'date.lte' ) ) {

    parts.push( _dateExcludingOngoing( cleanQuery.date ) );

  }

  return parts;

}


function _getQueryMustParts( cleanQuery, extensionQueries = {} ) {

  const parts = [];

  // term constraints
  
  [
    'uid', 
    'slug',
    [ 'keyword', 'search_internals_keywords', true ],
    [ 'lang', 'search_internals_languages', true ],
    [ 'locationUid', 'location.uid' ],
    [ 'city', 'location.city' ],
    [ 'region', 'location.region' ],
    [ 'department', 'location.department' ],
    [ 'countryCode', 'location.countryCode' ],
    [ 'contributorUid', 'contributor.uid' ],
    [ 'agendaUid', 'agenda.uid' ]
  ].forEach( field => {

    let fromField = _.isArray( field ) ? field[ 0 ] : field,

      toField = _.isArray( field ) ? field[ 1 ] : field,

      and = _.isArray( field ) ? field[ 2 ] : false;

    if ( _.get( cleanQuery, fromField, [] ).length > 1 && !and ) {

      parts.push( _mustPart( 'in', toField, cleanQuery[ fromField ] ) );

    } else {

      _.get( cleanQuery, fromField, [] )
        .map( _mustPart.bind( null, 'term', toField ) )
        .forEach( p => parts.push( p ) );
      
    }

  } );


  // add bounds constraints
  if ( 
    _.get( cleanQuery, 'geo.northEast.lat' )
    && _.get( cleanQuery, 'geo.northEast.lng' )
    && _.get( cleanQuery, 'geo.southWest.lat' )
    && _.get( cleanQuery, 'geo.southWest.lng' )
  ) {

    parts.push( _geoBounds( cleanQuery.geo ) );

  }


  // add multi_match search part
  if ( cleanQuery.search ) {

    parts.push( {
      multi_match: {
        query: cleanQuery.search,
        fields: [ 
          'search_internals_title',
          'search_internals_description',
          'search_internals_keywords_text',
          'search_internals_full_address_text',
        ]
      }
    } );

  }


  // add custom ( all is match )
  
  if ( extensionQueries && _.keys( extensionQueries ).length ) {

    _.keys( extensionQueries ).forEach( extension => {

      _.keys( extensionQueries[ extension ] ).forEach( field => {

        parts.push( _mustPart( 'match', extension + '.' + field, extensionQueries[ extension ][ field ] ) );

      } );

    } );

  }

  return parts;

}


function _dateExcludingOngoing( d ) {

  let range = {};

  if ( d.gte ) range.gte = d.gte;

  if ( d.lte ) range.lte = d.lte;


  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: {
        range: {
          'timings.begin' : range
        }
      }
    }
  }

}


function _localTime( t ) {

  let range = {};

  if ( t.gte ) range.gte = t.gte;

  if ( t.lte ) range.lte = t.lte;

  return {
    nested: {
      path: 'timings',
      score_mode: 'min',
      query: { range: {
        'timings.search_internals_begin_from_midnight' : range
      } }
    }
  };

}

function _geoBounds( b ) {

  return {
    geo_bounding_box: {
      search_internals_location: {
        top_left: { lat: b.northEast.lat, lon: b.southWest.lng },
        bottom_right: { lat: b.southWest.lat, lon: b.northEast.lng }
      }
    }
  }

}

function _mustPart( queryType, fieldName, value ) {

  let q = {};

  q[ queryType ] = {};

  q[ queryType ][ fieldName ] = value;

  return q;

}
