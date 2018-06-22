"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = event => {

  const location = _.get( event, 'location', {} );

  return ih( event, {
    location: {
      $set: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ location.latitude, location.longitude ]
        },
        properties: location
      }
    }
  } );

}