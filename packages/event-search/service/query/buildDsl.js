"use strict";

const set = require( 'lodash/set' );
const isArray = require( 'lodash/isArray' );

module.exports = ( cleanQuery, nav = null ) => {

  let mustParts = [],

    filterParts = [];

  let dsl = {
    sort: [ {
      'timings.end' : {
        mode: 'min',
        order: 'asc',
        nested_path: 'timings',
        nested_filter: {
          range: { 'timings.end' : { gte: 'now' } }
        }
      }
    }, {
      search_internals_last_timing: { order: 'desc' }
    } ],
    _source: {
      excludes: [ 'search_internals_*', 'timings.search_internals_*' ]
    }
  };


  // from / size?
  if ( nav && nav.size ) {

    dsl.from = nav.from;
    dsl.size = nav.size;

  }


  // add term constraints
  [ 
    'uid', 
    'slug',
    [ 'keyword', 'search_internals_keywords', true ],
    [ 'lang', 'search_internals_languages', true ],
    [ 'locationUid', 'location.uid' ],
    [ 'city', 'location.city' ],
    [ 'region', 'location.region' ],
    [ 'department', 'location.department' ],
    [ 'countryCode', 'location.countryCode' ]
  ].forEach( field => {

    let fromField = isArray( field ) ? field[ 0 ] : field,

      toField = isArray( field ) ? field[ 1 ] : field,

      and = isArray( field ) ? field[ 2 ] : false;

    if ( cleanQuery[ fromField ].length > 1 && !and ) {

      mustParts.push( _mustPart( 'in', toField, cleanQuery[ fromField ] ) );

    } else {

      mustParts = mustParts.concat( cleanQuery[ fromField ].map( _mustPart.bind( null, 'term', toField ) ) );
      
    }

  } );


  // add bounds constraints
  if ( 
    cleanQuery.geo.northEast.lat
    && cleanQuery.geo.northEast.lng 
    && cleanQuery.geo.southWest.lat 
    && cleanQuery.geo.southWest.lng
  ) {

    mustParts.push( _geoBounds( cleanQuery.geo ) );

  }


  // add multi_match search part
  if ( cleanQuery.search ) {

    mustParts.push( {
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


  if ( cleanQuery.localTime.gte || cleanQuery.localTime.lte ) {

    filterParts.push( _localTime( cleanQuery.localTime ) );

  }


  if ( mustParts.length === 1 ) {

    set( dsl, 'query', mustParts[ 0 ] );

  } else if ( mustParts.length > 1 ) {

    set( dsl, 'query.bool.must', mustParts );

  }


  if ( filterParts.length ) {

    set( dsl, 'query.bool.filter', filterParts );

  }

  return dsl;

}


function _localTime( t ) {

  let range = {};

  if ( t.gte ) {

    range.gte = t.gte;

  }

  if ( t.lte ) {

    range.lte = t.lte;

  }

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