"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );
const getPolygonField = require( './lib/getPolygonField' );
const applyTransforms = require( './lib/applyTransforms' );

const forwardURL = ( query, { key, pretty, countryCode, language } ) => [
  `https://api.opencagedata.com/geocode/v1/json?key=${key}&q=${encodeURIComponent( query )}`,
  countryCode ? '&countrycode=' + countryCode : '',
  pretty ? '&pretty=1' : '',
  language ? '&language=' + language : ''
].join( '' );

const reverseURL = ( latitude, longitude, { key, pretty, language } ) => [
  `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`,
  pretty ? '&pretty=1' : '',
  language ? '&language=' + language : ''
].join( '' );

module.exports = ( { key } ) => {

  return _.assign( geocode.bind( null, key ), {
    reverse: reverse.bind( null, key )
  } );

}

async function reverse( key, latitude, longitude, { first, language, raw } ) {

  const results = await axios.request( {
    url: reverseURL( latitude, longitude, { key, language } ),
  } ).then( r => _.get( r, 'data.results' ).map( parseResponseItem.bind( null, { raw } ) ) );

  const transformed = await _applyTransforms( results );

  return first ? _.first( transformed ) : transformed;

}

async function geocode( key, query, { countryCode, language, raw, first } ) {

  const {
    query: cleanQuery,
    countryCode: cleanCountryCode
  } = cleanGeocodeQuery( query, countryCode );

  const results = await axios.request( {
    url: forwardURL( cleanQuery, {
      key,
      countryCode: cleanCountryCode,
      language
    } )
  } ).then( r => _.get( r, 'data.results' ).map( parseResponseItem.bind( null, { raw } ) ) );

  const transformed = await _applyTransforms( results );

  return first ? _.first( transformed ) : transformed;

}


/**
 * DOMTOM, HONG KONG... country codes are not known by OpenCage
 */
function cleanGeocodeQuery( query, countryCode ) {

  for ( const transform of [ {
    from: [ 'YT', 'PF', 'GF', 'PM','MQ', 'GP', 'RE', 'NC' ],
    to: 'FR'
  }, {
    from: [ 'HK' ],
    to: 'CN'
  }, {
    from: [ 'AW' ],
    to: 'NL'
  } ] ) {

    if ( transform.from.includes( countryCode ) ) {

      return {
        countryCode: transform.to,
        query
      }

    }

  }

  return { countryCode, query };

}

function parseResponseItem( { raw }, item ) {

  const parsed = {
    address: _.get( item, 'formatted' ),
    district: _.get( item, 'components.city_district', _.get( item, 'components.suburb', null ) ),
    city: _.get( item, 'components.village', _.get( item, 'components.town', _.get( item, 'components.city', null ) ) ),
    department: _.get( item, 'components.state_district', null ),
    region: _.get( item, 'components.state', null ),
    timezone: _.get( item, 'annotations.timezone.name', null ),
    latitude: _.get( item, 'geometry.lat', null ),
    longitude: _.get( item, 'geometry.lng', null ),
    country: _.get( item, 'components.country', null ),
    countryCode: _.get( item, 'components.country_code', null )
  };

  if ( raw ) {
    parsed.raw = item;
  }

  return parsed;

}

async function _applyTransforms( geocodeResults ) {

  if ( !geocodeResults.length ) return geocodeResults;

  return Promise.all(
    geocodeResults.map( _applyTransformsOnGeocodeItem )
  );

}

async function _applyTransformsOnGeocodeItem( geocodeResult ) {

  const updated = applyTransforms( geocodeResult );

  const district = await getPolygonField( 'district', updated );

  if ( district ) {
    updated.district = district;
  }

  return updated;

}
