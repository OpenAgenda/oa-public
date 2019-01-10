"use strict";

const _ = require( 'lodash' );

module.exports = data => {

  const parsed = _.mapValues( {
    u: 'uid',
    lt: 'latitude',
    lg: 'longitude'
  }, value => _.get( data, value ) );

  return parsed;

};
