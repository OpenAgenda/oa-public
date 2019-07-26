"use strict";

const _ = require( 'lodash' );

const name = require( '../package.json' ).name.split( '/' ).pop();

module.exports = _.assign( ( config = {} ) => {

  let eventSchema;

  return _.assign( {
    name,
    config
  }, config.interfaces, {
    getEventSchema: async () => eventSchema ?
      eventSchema :
      eventSchema = await config.interfaces.getEventSchema()
  } );

}, {
  router: require( './router' )
} );
