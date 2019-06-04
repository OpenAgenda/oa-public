"use strict";

const formatEvent = require( '@openagenda/legacy/rebuildSearchIndex/formatEvent' );

module.exports = ( { update, knex, imageBasePath } ) => {

  return async identifier => update(
    await formatEvent( { knex, imageBasePath }, identifier )
  );

}
