"use strict";

const axios = require( 'axios' );
const inside = require( 'point-in-polygon' );


module.exports = async location => {


  if ( location.district ) {
    return location.district;
  }

  const set = await getDistrictsSet( location ).catch( () => null );

  if ( !set ) {
    return null;
  }

  const matching = set.filter( district =>
    inside( [ location.longitude, location.latitude ], district.polygon )
  );

  if ( matching.length ) {
    return matching[ 0 ].district;
  }

  return null;
};

async function getDistrictsSet( location ) {
  const countryCode = (location.countryCode || '').toUpperCase();

  return axios.get( `https://s3.eu-west-1.amazonaws.com/oasvc/geocoder/${countryCode}.${location.city}.json` )
    .then( ({ data }) => data );
}
