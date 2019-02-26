"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );

const forwardURL = query => [
  `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent( query )}`
].join( '' );

const detailedURL = ( latitude, longitude ) => `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}&fields=region,departement`;

module.exports = () => {

  return _.assign( geocode.bind( null ), {
    detailed: detailed.bind( null ),
    reverse: reverse.bind( null )
  } );

}

async function reverse( latitude, longitude ) {
}

async function geocode( query, { raw, first } ) {

  const results = await axios.request( {
    url: forwardURL( query ),
  } ).then( r => _.get( r, 'data.features' ).map( parseResponseItem.bind( null, { raw } ) ) );

  return first ? _.first( results ) : results;

}

async function detailed( query, options = {} ) {

  const {
    raw
  } = options || {};

  const result = await geocode( query, { raw, first: true } );

  if ( !_.get( result, 'insee' ) ) return result;

  const { data: details } = await axios.request( detailedURL( result.latitude, result.longitude ) );

  if ( !details ) return result;

  _.assign( result, {
    department: _.get( details, '0.departement.nom' ),
    region: _.get( details, '0.region.nom' )
  } );

  if ( raw ) result.rawDetails = details;

  return result;

}

function parseResponseItem( { raw }, item ) {

  const parsed = {
    address: _.get( item, 'properties.label' ),
    city: _.get( item, 'properties.city' ),
    postalCode: _.get( item, 'properties.postcode' ),
    insee: _.get( item, 'properties.citycode' ),
    latitude: _.get( item, 'geometry.coordinates[1]' ),
    longitude: _.get( item, 'geometry.coordinates[0]' )
  };

  if ( raw ) parsed.raw = item;

  return parsed;

}
