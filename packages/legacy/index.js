"use strict";

const controlData = require( './controlData' );

module.exports = ( { knex, redis } ) => {

  return {
    controlData: controlData.bind( null, { knex, redis } )
  }

}
