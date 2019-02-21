"use strict";

const _ = require( 'lodash' );

module.exports = ( proxy, config ) => {

  const {
    refreshInterval
  } = _.assign( {
    refreshInterval: 60*60*1000,
  }, config );

  setInterval( () => {

    proxy.clearCache();

  }, refreshInterval );

}
