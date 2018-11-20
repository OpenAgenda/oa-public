"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'notify' );

module.exports = ( operation, data ) => {

  log( 'info', '[UNUSED] notify:%s', operation, _.pick( data, [ 'id', 'uid', 'slug' ] ) );

}
