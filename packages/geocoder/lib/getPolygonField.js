"use strict";

const axios = require( 'axios' );
const inside = require( 'point-in-polygon' );


module.exports = async ( field, location ) => {
  if ( location[ field ] ) {
    return location[ field ];
  }

  const set = await getPolygonsSet( field, location ).catch( () => null );

  if ( !set ) {
    return null;
  }

  const matching = set.filter( val =>
    inside( [ location.longitude, location.latitude ], val.polygon )
  );

  if ( matching.length ) {
    return matching[ 0 ][ field ];
  }

  return null;
};

async function getPolygonsSet( field, location ) {
  const countryCode = (location.countryCode || '').toUpperCase();

  return axios.get( `https://s3.eu-west-1.amazonaws.com/oasvc/geocoder/${field}/${countryCode}.${location.city}.json` )
    .then( ({ data }) => data );
}
