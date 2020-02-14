"use strict";

const _ = require( 'lodash' );

module.exports = data => ( {
  type: 'FeatureCollection',
  features: _.get( data, 'events', [] ).map( e => ( {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ _.get( e, 'location.longitude' ), _.get( e, 'location.latitude' ) ]
    },
    properties: e
  } ) )
} );