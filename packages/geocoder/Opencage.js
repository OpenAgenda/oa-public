"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );

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

  return first ? _.first( results ) : results;

}

async function geocode( key, query, { countryCode, language, raw, first } ) {

  const results = await axios.request( {
    url: forwardURL( query, { key, countryCode, language } ),
  } ).then( r => _.get( r, 'data.results' ).map( parseResponseItem.bind( null, { raw } ) ) );

  return first ? _.first( results ) : results;

}

function parseResponseItem( { raw }, item ) {

  const parsed = {
    address: _.get( item, 'formatted' ),
    district: _.get( item, 'components.city_district', null ),
    city: _.get( item, 'components.town', _.get( item, 'components.city', null ) ),
    department: _.get( item, 'components.county', null ),
    region: _.get( item, 'components.state', null ),
    timezone: _.get( item, 'annotations.timezone.name', null ),
    latitude: _.get( item, 'geometry.lat', null ),
    longitude: _.get( item, 'geometry.lng', null ),
    country: _.get( item, 'components.country', null ),
    countryCode: _.get( item, 'components.country_code', null )
  };

  if ( raw ) parsed.raw = item;

  return parsed;

}
